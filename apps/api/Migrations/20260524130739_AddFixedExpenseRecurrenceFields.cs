using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddFixedExpenseRecurrenceFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "anchor_date",
                table: "fixed_expenses",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "recurrence_interval",
                table: "fixed_expenses",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "recurrence_unit",
                table: "fixed_expenses",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "skip_until_date",
                table: "fixed_expenses",
                type: "date",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_fixed_expenses_user_id_is_active",
                table: "fixed_expenses",
                columns: new[] { "user_id", "is_active" });

            migrationBuilder.AddCheckConstraint(
                name: "ck_fixed_expenses_amount_positive",
                table: "fixed_expenses",
                sql: "amount > 0");

            migrationBuilder.AddCheckConstraint(
                name: "ck_fixed_expenses_recurrence_interval_positive",
                table: "fixed_expenses",
                sql: "recurrence_interval IS NULL OR recurrence_interval > 0");

            migrationBuilder.AddCheckConstraint(
                name: "ck_fixed_expenses_recurrence_unit_valid",
                table: "fixed_expenses",
                sql: "recurrence_unit IS NULL OR recurrence_unit IN ('Day', 'Week', 'Month')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_fixed_expenses_user_id_is_active",
                table: "fixed_expenses");

            migrationBuilder.DropCheckConstraint(
                name: "ck_fixed_expenses_amount_positive",
                table: "fixed_expenses");

            migrationBuilder.DropCheckConstraint(
                name: "ck_fixed_expenses_recurrence_interval_positive",
                table: "fixed_expenses");

            migrationBuilder.DropCheckConstraint(
                name: "ck_fixed_expenses_recurrence_unit_valid",
                table: "fixed_expenses");

            migrationBuilder.DropColumn(
                name: "anchor_date",
                table: "fixed_expenses");

            migrationBuilder.DropColumn(
                name: "recurrence_interval",
                table: "fixed_expenses");

            migrationBuilder.DropColumn(
                name: "recurrence_unit",
                table: "fixed_expenses");

            migrationBuilder.DropColumn(
                name: "skip_until_date",
                table: "fixed_expenses");
        }
    }
}
