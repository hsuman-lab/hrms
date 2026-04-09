using HRMSPlatform.Modules.EmployeeManagement.Application.Commands;
using HRMSPlatform.Modules.EmployeeManagement.Application.Queries;
using HRMSPlatform.Modules.EmployeeManagement.Domain;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSPlatform.Modules.EmployeeManagement.API;

[ApiController]
[Route("api/v1/employees")]
[Authorize]
public sealed class EmployeesController(ISender mediator) : ControllerBase
{
    /// <summary>Create a new employee. Triggers onboarding workflow.</summary>
    [HttpPost]
    [Authorize(Roles = "HR_ADMIN")]
    [ProducesResponseType(typeof(EmployeeDto), 201)]
    public async Task<IActionResult> Create([FromBody] CreateEmployeeRequest req, CancellationToken ct)
    {
        var result = await mediator.Send(new CreateEmployeeCommand(
            req.FirstName, req.LastName, req.PersonalEmail, req.Phone,
            req.HireDate, req.EmploymentType, req.DepartmentId,
            req.PositionId, req.ReportsToId, req.CustomFields), ct);

        return result.IsFailure
            ? BadRequest(new { error = result.Error.Description })
            : CreatedAtAction(nameof(GetById), new { employeeId = result.Value.Id }, result.Value);
    }

    /// <summary>Get paginated, filtered employee list.</summary>
    [HttpGet]
    [ProducesResponseType(200)]
    public async Task<IActionResult> List(
        [FromQuery] string? department,
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await mediator.Send(
            new ListEmployeesQuery(department, status, search, page, pageSize), ct);
        return Ok(result.Value);
    }

    /// <summary>Get a single employee with full details.</summary>
    [HttpGet("{employeeId:guid}")]
    [ProducesResponseType(typeof(EmployeeDetailDto), 200)]
    public async Task<IActionResult> GetById(Guid employeeId, CancellationToken ct)
    {
        var result = await mediator.Send(new GetEmployeeByIdQuery(employeeId), ct);
        return result.IsFailure ? NotFound() : Ok(result.Value);
    }

    /// <summary>Transfer an employee to a new department / position.</summary>
    [HttpPost("{employeeId:guid}/transfer")]
    [Authorize(Roles = "HR_ADMIN")]
    public async Task<IActionResult> Transfer(Guid employeeId, [FromBody] TransferRequest req, CancellationToken ct)
    {
        var result = await mediator.Send(new TransferEmployeeCommand(
            employeeId, req.NewDepartmentId, req.NewPositionId, req.NewReportsToId, req.NewLocationId), ct);
        return result.IsFailure ? NotFound() : NoContent();
    }

    /// <summary>Terminate an employee. Triggers FnF payroll and access revocation.</summary>
    [HttpPost("{employeeId:guid}/terminate")]
    [Authorize(Roles = "HR_ADMIN")]
    public async Task<IActionResult> Terminate(Guid employeeId, [FromBody] TerminateRequest req, CancellationToken ct)
    {
        var result = await mediator.Send(
            new TerminateEmployeeCommand(employeeId, req.ExitDate, req.Reason), ct);
        return result.IsFailure ? NotFound() : NoContent();
    }
}

[ApiController]
[Route("api/v1/departments")]
[Authorize]
public sealed class DepartmentsController : ControllerBase
{
    [HttpGet]
    public IActionResult List() => Ok(Array.Empty<object>()); // wired to dept repo
}

public record CreateEmployeeRequest(
    string FirstName,
    string LastName,
    string PersonalEmail,
    string Phone,
    DateOnly HireDate,
    EmploymentType EmploymentType,
    Guid? DepartmentId,
    Guid? PositionId,
    Guid? ReportsToId,
    string? CustomFields = null);

public record TransferRequest(
    Guid? NewDepartmentId,
    Guid? NewPositionId,
    Guid? NewReportsToId,
    Guid? NewLocationId);

public record TerminateRequest(DateOnly ExitDate, string Reason);
