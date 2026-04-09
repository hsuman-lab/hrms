using HRMSPlatform.SharedKernel.Events;
namespace HRMSPlatform.SharedKernel.Interfaces;

public interface IEventBus
{
    Task PublishAsync<T>(T integrationEvent, CancellationToken ct = default) where T : IIntegrationEvent;
}
