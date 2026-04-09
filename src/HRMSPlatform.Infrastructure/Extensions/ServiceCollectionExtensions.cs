using HRMSPlatform.Infrastructure.Caching;
using HRMSPlatform.Infrastructure.Messaging;
using HRMSPlatform.Infrastructure.MultiTenancy;
using HRMSPlatform.Infrastructure.Persistence;
using HRMSPlatform.Infrastructure.Persistence.Outbox;
using HRMSPlatform.Infrastructure.Security;
using HRMSPlatform.SharedKernel.Interfaces;
using HRMSPlatform.SharedKernel.MultiTenancy;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using StackExchange.Redis;

namespace HRMSPlatform.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration config)
    {
        services.AddDatabase(config);
        services.AddRedis(config);
        services.AddKafka(config);
        services.AddSecurity(config);
        services.AddMultiTenancy();
        services.AddObservability(config);
        services.AddHostedService<OutboxProcessor>();
        return services;
    }

    private static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<HrmsDbContext>(opts =>
            opts.UseNpgsql(config.GetConnectionString("DefaultConnection"),
                npgsql => npgsql
                    .EnableRetryOnFailure(3, TimeSpan.FromSeconds(5), null)
                    .MigrationsHistoryTable("__ef_migrations_history", "public"))
                .UseSnakeCaseNamingConvention());
        return services;
    }

    private static IServiceCollection AddRedis(this IServiceCollection services, IConfiguration config)
    {
        services.AddSingleton<IConnectionMultiplexer>(_ =>
            ConnectionMultiplexer.Connect(config.GetConnectionString("Redis") ?? "localhost:6379"));
        services.AddSingleton<ICacheService, RedisCacheService>();
        return services;
    }

    private static IServiceCollection AddKafka(this IServiceCollection services, IConfiguration config)
    {
        services.AddSingleton<IEventBus, KafkaEventBus>();
        return services;
    }

    private static IServiceCollection AddSecurity(this IServiceCollection services, IConfiguration config)
    {
        services.AddSingleton<JwtService>();
        services.AddSingleton<EncryptionService>();
        return services;
    }

    private static IServiceCollection AddMultiTenancy(this IServiceCollection services)
    {
        services.AddScoped<ITenantContext, TenantContext>();
        return services;
    }

    private static IServiceCollection AddObservability(this IServiceCollection services, IConfiguration config)
    {
        services.AddOpenTelemetry()
            .WithTracing(tracing => tracing
                .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService("hrms-platform"))
                .AddAspNetCoreInstrumentation()
                .AddEntityFrameworkCoreInstrumentation()
                .AddJaegerExporter(o =>
                {
                    o.AgentHost = config["Jaeger:Host"] ?? "localhost";
                    o.AgentPort = int.Parse(config["Jaeger:Port"] ?? "6831");
                }));
        return services;
    }
}
