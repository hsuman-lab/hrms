using HRMSPlatform.Modules.TenantManagement.Domain;
using HRMSPlatform.Modules.TenantManagement.Infrastructure;
using HRMSPlatform.SharedKernel.Common;
using MediatR;

namespace HRMSPlatform.Modules.TenantManagement.Application.Commands;

public record CreateTenantCommand(
    string Slug,
    string DisplayName,
    string Region,
    Guid PlanId,
    bool IsTrial = true) : IRequest<Result<TenantDto>>;

public record TenantDto(Guid Id, string Slug, string DisplayName, string Status, string Region, string DbSchema, DateTime CreatedAt);

public sealed class CreateTenantHandler(ITenantRepository repo, IUnitOfWorkTenant uow)
    : IRequestHandler<CreateTenantCommand, Result<TenantDto>>
{
    public async Task<Result<TenantDto>> Handle(CreateTenantCommand cmd, CancellationToken ct)
    {
        var existing = await repo.FindBySlugAsync(cmd.Slug, ct);
        if (existing is not null)
            return Result.Failure<TenantDto>(Error.Conflict);

        var tenant = Tenant.Create(cmd.Slug, cmd.DisplayName, cmd.Region, cmd.PlanId, cmd.IsTrial);
        await repo.AddAsync(tenant, ct);
        await uow.SaveChangesAsync(ct);

        return new TenantDto(tenant.Id, tenant.Slug, tenant.DisplayName,
            tenant.Status.ToString(), tenant.Region, tenant.DbSchemaName, tenant.CreatedAt);
    }
}
