using api.Application.Abstractions;
using api.Application.FixedExpenses.Contracts;
using api.Domain.Entities;
using api.Domain.Enums;

namespace api.Application.FixedExpenses;

public class FixedExpenseService(IFixedExpenseRepository repository) : IFixedExpenseService
{
    public async Task<List<FixedExpenseResponse>> GetAllAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        List<FixedExpense> expenses = await repository.GetAllByUserIdAsync(userId, cancellationToken);
        return expenses.Select(Map).ToList();
    }

    public async Task<FixedExpenseResponse?> GetByIdAsync(Guid userId, Guid id, CancellationToken cancellationToken = default)
    {
        FixedExpense? expense = await repository.GetByIdAsync(userId, id, cancellationToken);
        return expense is null ? null : Map(expense);
    }

    public async Task<FixedExpenseResponse> CreateAsync(
        Guid userId,
        CreateFixedExpenseRequest request,
        CancellationToken cancellationToken = default)
    {
        DateOnly anchorDate = request.AnchorDate!.Value;

        var expense = new FixedExpense
        {
            UserId = userId,
            Name = request.Name.Trim(),
            Amount = request.Amount!.Value,
            IsActive = request.IsActive,
            AnchorDate = anchorDate,
            RecurrenceUnit = request.RecurrenceUnit!.Value,
            RecurrenceInterval = request.RecurrenceInterval!.Value,
            SkipUntilDate = request.SkipUntilDate,
        };

        await repository.AddAsync(expense, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        return Map(expense);
    }

    public async Task<FixedExpenseResponse?> UpdateAsync(
        Guid userId,
        Guid id,
        UpdateFixedExpenseRequest request,
        CancellationToken cancellationToken = default)
    {
        FixedExpense? expense = await repository.GetByIdAsync(userId, id, cancellationToken);
        if (expense is null)
        {
            return null;
        }

        DateOnly anchorDate = request.AnchorDate!.Value;

        expense.Name = request.Name.Trim();
        expense.Amount = request.Amount!.Value;
        expense.IsActive = request.IsActive;
        expense.AnchorDate = anchorDate;
        expense.RecurrenceUnit = request.RecurrenceUnit!.Value;
        expense.RecurrenceInterval = request.RecurrenceInterval!.Value;
        expense.SkipUntilDate = request.SkipUntilDate;

        await repository.SaveChangesAsync(cancellationToken);

        return Map(expense);
    }

    public async Task<bool> DeleteAsync(Guid userId, Guid id, CancellationToken cancellationToken = default)
    {
        FixedExpense? expense = await repository.GetByIdAsync(userId, id, cancellationToken);
        if (expense is null)
        {
            return false;
        }

        await repository.DeleteAsync(expense, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static FixedExpenseResponse Map(FixedExpense expense)
    {
        return new FixedExpenseResponse(
            expense.Id,
            expense.Name,
            expense.Amount,
            expense.IsActive,
            expense.AnchorDate,
            expense.RecurrenceUnit,
            expense.RecurrenceInterval,
            expense.SkipUntilDate,
            CalculateNextDueDate(expense, DateOnly.FromDateTime(DateTime.UtcNow)),
            expense.CreatedAtUtc);
    }

    private static DateOnly? CalculateNextDueDate(FixedExpense expense, DateOnly today)
    {
        if (!expense.IsActive)
        {
            return null;
        }

        DateOnly referenceDate = today;
        if (expense.SkipUntilDate.HasValue && expense.SkipUntilDate.Value > referenceDate)
        {
            referenceDate = expense.SkipUntilDate.Value;
        }

        return CalculateFromRecurrence(
            expense.AnchorDate,
            expense.RecurrenceUnit,
            expense.RecurrenceInterval,
            referenceDate);
    }

    private static DateOnly? CalculateFromRecurrence(
        DateOnly anchorDate,
        RecurrenceUnit recurrenceUnit,
        int recurrenceInterval,
        DateOnly referenceDate)
    {
        if (recurrenceInterval <= 0)
        {
            return null;
        }

        return recurrenceUnit switch
        {
            RecurrenceUnit.Day => CalculateFixedDayInterval(anchorDate, recurrenceInterval, referenceDate),
            RecurrenceUnit.Week => CalculateFixedDayInterval(anchorDate, recurrenceInterval * 7, referenceDate),
            RecurrenceUnit.Month => CalculateFixedMonthInterval(anchorDate, recurrenceInterval, referenceDate),
            _ => null,
        };
    }

    private static DateOnly CalculateFixedDayInterval(DateOnly anchorDate, int intervalInDays, DateOnly referenceDate)
    {
        if (anchorDate >= referenceDate)
        {
            return anchorDate;
        }

        int elapsedDays = referenceDate.DayNumber - anchorDate.DayNumber;
        int periodsElapsed = elapsedDays / intervalInDays;
        DateOnly candidate = anchorDate.AddDays(periodsElapsed * intervalInDays);

        return candidate < referenceDate ? candidate.AddDays(intervalInDays) : candidate;
    }

    private static DateOnly CalculateFixedMonthInterval(DateOnly anchorDate, int intervalInMonths, DateOnly referenceDate)
    {
        if (anchorDate >= referenceDate)
        {
            return anchorDate;
        }

        int elapsedMonths = (referenceDate.Year - anchorDate.Year) * 12 + (referenceDate.Month - anchorDate.Month);
        int periodsElapsed = Math.Max(0, elapsedMonths / intervalInMonths);

        DateOnly candidate = anchorDate.AddMonths(periodsElapsed * intervalInMonths);
        while (candidate < referenceDate)
        {
            periodsElapsed++;
            candidate = anchorDate.AddMonths(periodsElapsed * intervalInMonths);
        }

        return candidate;
    }

}