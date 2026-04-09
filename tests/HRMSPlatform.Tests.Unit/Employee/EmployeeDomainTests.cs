using FluentAssertions;
using HRMSPlatform.Modules.EmployeeManagement.Domain;
using HRMSPlatform.Modules.EmployeeManagement.Domain.Events;
using Xunit;

namespace HRMSPlatform.Tests.Unit.Employee;

public sealed class EmployeeDomainTests
{
    [Fact]
    public void Create_SetsStatusToProbation()
    {
        var emp = Employee.Create(
            Guid.NewGuid(), "EMP001", "John", "Doe", "john@example.com",
            new DateOnly(2025, 1, 1), EmploymentType.FullTime, null, null, null);

        emp.Status.Should().Be(EmployeeStatus.Probation);
        emp.FullName.Should().Be("John Doe");
    }

    [Fact]
    public void Create_RaisesEmployeeCreatedEvent()
    {
        var emp = Employee.Create(
            Guid.NewGuid(), "EMP001", "Jane", "Smith", "jane@example.com",
            new DateOnly(2025, 1, 15), EmploymentType.FullTime, null, null, null);

        emp.DomainEvents.Should().ContainSingle(e => e is EmployeeCreatedEvent);
    }

    [Fact]
    public void Terminate_SetsStatusAndExitDate()
    {
        var emp = Employee.Create(
            Guid.NewGuid(), "EMP002", "Bob", "Jones", "bob@example.com",
            new DateOnly(2024, 1, 1), EmploymentType.FullTime, null, null, null);

        var exitDate = new DateOnly(2025, 3, 31);
        emp.Terminate(exitDate, "Resignation");

        emp.Status.Should().Be(EmployeeStatus.Terminated);
        emp.ExitDate.Should().Be(exitDate);
        emp.ExitReason.Should().Be("Resignation");
    }

    [Fact]
    public void Terminate_RaisesTerminatedDomainEvent()
    {
        var emp = Employee.Create(
            Guid.NewGuid(), "EMP003", "Alice", "Brown", "alice@example.com",
            new DateOnly(2024, 1, 1), EmploymentType.FullTime, null, null, null);

        emp.Terminate(new DateOnly(2025, 4, 30), "End of contract");

        emp.DomainEvents.Should().Contain(e => e is EmployeeTerminatedEvent);
    }

    [Fact]
    public void Transfer_UpdatesDepartmentAndReportsTo()
    {
        var emp = Employee.Create(
            Guid.NewGuid(), "EMP004", "Charlie", "Davis", "charlie@example.com",
            new DateOnly(2024, 6, 1), EmploymentType.FullTime, Guid.NewGuid(), null, null);

        var newDept = Guid.NewGuid();
        var newManager = Guid.NewGuid();
        emp.Transfer(newDept, null, newManager, null);

        emp.DepartmentId.Should().Be(newDept);
        emp.ReportsToId.Should().Be(newManager);
        emp.DomainEvents.Should().Contain(e => e is EmployeeTransferredEvent);
    }
}
