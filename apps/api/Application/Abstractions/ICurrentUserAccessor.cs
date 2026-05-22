namespace api.Application.Abstractions;

public interface ICurrentUserAccessor
{
    bool TryGetUserId(out Guid userId);
}
