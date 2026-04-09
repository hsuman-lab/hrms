using HRMSPlatform.Modules.EmployeeManagement.Domain.Events;
using HRMSPlatform.SharedKernel.Domain;

namespace HRMSPlatform.Modules.EmployeeManagement.Domain;

public enum EmployeeStatus { Active, OnLeave, Terminated, Probation, OnNotice }
public enum EmploymentType { FullTime, PartTime, Contract, Intern }
public enum Gender { Male, Female, Other, PreferNotToSay }

public sealed class Employee : AggregateRoot<Guid>
{
    private Employee() { }

    public Guid TenantId { get; private set; }
    public string EmployeeNumber { get; private set; } = string.Empty;
    public Guid? UserId { get; private set; }
    public EmployeeStatus Status { get; private set; }
    public EmploymentType EmploymentType { get; private set; }

    // Personal info
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public DateOnly? DateOfBirth { get; private set; }
    public Gender Gender { get; private set; }
    public string Nationality { get; private set; } = string.Empty;
    public string PersonalEmail { get; private set; } = string.Empty;   // encrypted
    public string Phone { get; private set; } = string.Empty;           // encrypted
    public string? NationalId { get; private set; }                      // encrypted PAN/Aadhaar/SSN

    // Employment
    public DateOnly HireDate { get; private set; }
    public DateOnly? ProbationEndDate { get; private set; }
    public DateOnly? ConfirmationDate { get; private set; }
    public DateOnly? ExitDate { get; private set; }
    public string? ExitReason { get; private set; }

    // Org structure
    public Guid? DepartmentId { get; private set; }
    public Guid? PositionId { get; private set; }
    public Guid? LocationId { get; private set; }
    public Guid? ReportsToId { get; private set; }

    // Extensible
    public string? CustomFields { get; private set; }   // JSON blob

    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    public static Employee Create(
        Guid tenantId,
        string employeeNumber,
        string firstName,
        string lastName,
        string personalEmail,
        DateOnly hireDate,
        EmploymentType employmentType,
        Guid? departmentId,
        Guid? positionId,
        Guid? reportsToId)
    {
        var emp = new Employee
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EmployeeNumber = employeeNumber,
            FirstName = firstName,
            LastName = lastName,
            PersonalEmail = personalEmail,
            HireDate = hireDate,
            EmploymentType = employmentType,
            Status = EmployeeStatus.Probation,
            DepartmentId = departmentId,
            PositionId = positionId,
            ReportsToId = reportsToId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        emp.AddDomainEvent(new EmployeeCreatedEvent(emp.Id, tenantId, emp.FullName, hireDate, departmentId, positionId));
        return emp;
    }

    public void LinkUserAccount(Guid userId)
    {
        UserId = userId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Confirm()
    {
        Status = EmployeeStatus.Active;
        ConfirmationDate = DateOnly.FromDateTime(DateTime.UtcNow);
        UpdatedAt = DateTime.UtcNow;
    }

    public void Transfer(Guid? newDeptId, Guid? newPositionId, Guid? newReportsToId, Guid? newLocationId)
    {
        var old = new { DepartmentId, PositionId, ReportsToId };
        DepartmentId = newDeptId;
        PositionId = newPositionId;
        ReportsToId = newReportsToId;
        LocationId = newLocationId;
        UpdatedAt = DateTime.UtcNow;
        AddDomainEvent(new EmployeeTransferredEvent(Id, TenantId, old.DepartmentId, newDeptId));
    }

    public void Terminate(DateOnly exitDate, string reason)
    {
        Status = EmployeeStatus.Terminated;
        ExitDate = exitDate;
        ExitReason = reason;
        UpdatedAt = DateTime.UtcNow;
        AddDomainEvent(new EmployeeTerminatedEvent(Id, TenantId, exitDate, reason));
    }

    public void UpdatePersonalInfo(string? phone, string? nationality, Gender gender, DateOnly? dob)
    {
        if (phone is not null) Phone = phone;
        if (nationality is not null) Nationality = nationality;
        Gender = gender;
        DateOfBirth = dob;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetNationalId(string encryptedNationalId)
    {
        NationalId = encryptedNationalId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateCustomFields(string json)
    {
        CustomFields = json;
        UpdatedAt = DateTime.UtcNow;
    }
}
