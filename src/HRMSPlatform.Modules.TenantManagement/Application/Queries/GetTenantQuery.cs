using HRMSPlatform.Modules.TenantManagement.Application.Commands;
using HRMSPlatform.Modules.TenantManagement.Infrastructure;
using HRMSPlatform.SharedKernel.Common;
using MediatR;

namespace HRMSPlatform.Modules.TenantManagement.Application.Queries;

public record GetTenantByIdQuery(Guid TenantId) : IRequest<Result<TenantDto>>;
public record GetTenantBySlugQuery(string Slug) : IRequest<Result<TenantDto>>;

public sealed class GetTenantByIdHandler(ITenantRepository repo)
    : IRequestHandler<GetTenantByIdQuery, Result<TenantDto>>
{
    public async Task<Result<TenantDto>> Handle(GetTenantByIdQuery q, CancellationToken ct)
    {
        var t = await repo.GetByIdAsync(q.TenantId, ct);
        if (t is null) return Result.Failure<TenantDto>(Error.NotFound);
        return new TenantDto(t.Id, t.Slug, t.DisplayName, t.Status.ToString(), t.Region, t.DbSchemaName, t.CreatedAt);
    }
}

public sealed class GetTenantBySlugHandler(ITenantRepository repo)
    : IRequestHandler<GetTenantBySlugQuery, Result<TenantDto>>
{
    public async Task<Result<TenantDto>> Handle(GetTenantBySlugQuery q, CancellationToken ct)
    {
        var t = await repo.FindBySlugAsync(q.Slug, ct);
        if (t is null) return Result.Failure<TenantDto>(Error.NotFound);
        return new TenantDto(t.Id, t.Slug, t.DisplayName, t.Status.ToString(), t.Region, t.DbSchemaName, t.CreatedAt);
    }
}
