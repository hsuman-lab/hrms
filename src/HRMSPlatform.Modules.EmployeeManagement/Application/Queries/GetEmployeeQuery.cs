using HRMSPlatform.Modules.EmployeeManagement.Application.Commands;
using HRMSPlatform.Modules.EmployeeManagement.Infrastructure;
using HRMSPlatform.SharedKernel.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HRMSPlatform.Modules.EmployeeManagement.Application.Queries;

public record GetEmployeeByIdQuery(Guid EmployeeId) : IRequest<Result<EmployeeDetailDto>>;

public record ListEmployeesQuery(
    string? DepartmentId = null,
    string? Status = null,
    string? SearchTerm = null,
    int Page = 1,
    int PageSize = 20) : IRequest<Result<PagedList<EmployeeDto>>>;

public record GetOrgChartQuery(Guid? RootEmployeeId = null, int Depth = 3) : IRequest<Result<OrgNodeDto>>;

public record EmployeeDetailDto(
    Guid Id,
    string EmployeeNumber,
    string FirstName,
    string LastName,
    string FullName,
    string Status,
    string EmploymentType,
    DateOnly HireDate,
    DateOnly? ExitDate,
    Guid? DepartmentId,
    string? DepartmentName,
    Guid? PositionId,
    string? PositionTitle,
    Guid? ReportsToId,
    string? ReportsToName,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record OrgNodeDto(Guid Id, string Name, string Title, List<OrgNodeDto> Reports);

public sealed class GetEmployeeByIdHandler(IEmployeeRepository repo)
    : IRequestHandler<GetEmployeeByIdQuery, Result<EmployeeDetailDto>>
{
    public async Task<Result<EmployeeDetailDto>> Handle(GetEmployeeByIdQuery q, CancellationToken ct)
    {
        var emp = await repo.GetByIdWithDetailsAsync(q.EmployeeId, ct);
        if (emp is null) return Result.Failure<EmployeeDetailDto>(Error.NotFound);
        return emp;
    }
}

public sealed class ListEmployeesHandler(IEmployeeRepository repo)
    : IRequestHandler<ListEmployeesQuery, Result<PagedList<EmployeeDto>>>
{
    public async Task<Result<PagedList<EmployeeDto>>> Handle(ListEmployeesQuery q, CancellationToken ct)
    {
        var result = await repo.ListAsync(q.DepartmentId, q.Status, q.SearchTerm, q.Page, q.PageSize, ct);
        return result;
    }
}
