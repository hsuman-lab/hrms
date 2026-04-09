using System.Text;
using FluentValidation;
using HRMSPlatform.Infrastructure.Extensions;
using HRMSPlatform.Infrastructure.MultiTenancy;
using HRMSPlatform.API.Middleware;
using HRMSPlatform.Modules.Attendance.Infrastructure;
using HRMSPlatform.Modules.Audit.Infrastructure;
using HRMSPlatform.Modules.Billing.Infrastructure;
using HRMSPlatform.Modules.EmployeeManagement.Infrastructure;
using HRMSPlatform.Modules.IAM.Infrastructure;
using HRMSPlatform.Modules.LMS.Infrastructure;
using HRMSPlatform.Modules.LeaveManagement.Infrastructure;
using HRMSPlatform.Modules.Notifications.Infrastructure;
using HRMSPlatform.Modules.Onboarding.Infrastructure;
using HRMSPlatform.Modules.Payroll.Application.Compliance;
using HRMSPlatform.Modules.Workflow.Infrastructure;
using HRMSPlatform.Modules.Payroll.Application.FormulaEngine;
using HRMSPlatform.Modules.Payroll.Infrastructure;
using HRMSPlatform.Modules.Reporting.Infrastructure;
using HRMSPlatform.Modules.TenantManagement.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Prometheus;
using Serilog;
using Serilog.Events;

// ─── Bootstrap Serilog ────────────────────────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithEnvironmentName()
    .Enrich.WithMachineName()
    .WriteTo.Console(outputTemplate:
        "[{Timestamp:HH:mm:ss} {Level:u3}] {TenantId} {CorrelationId} {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog();

var config = builder.Configuration;
var services = builder.Services;

// ─── Infrastructure (Redis, Kafka, EF, JWT, OTel) ─────────────────────────────
services.AddInfrastructure(config);

// ─── Module DbContexts (all pointing to same PostgreSQL, isolated by RLS) ─────
var connStr = config.GetConnectionString("DefaultConnection")!;

services.AddDbContext<TenantDbContext>(o => o.UseNpgsql(connStr).UseSnakeCaseNamingConvention());
services.AddDbContext<IamDbContext>(o => o.UseNpgsql(connStr).UseSnakeCaseNamingConvention());
services.AddDbContext<EmployeeDbContext>(o => o.UseNpgsql(connStr).UseSnakeCaseNamingConvention());
services.AddDbContext<OnboardingDbContext>(o => o.UseNpgsql(connStr).UseSnakeCaseNamingConvention());
services.AddDbContext<LeaveDbContext>(o => o.UseNpgsql(connStr).UseSnakeCaseNamingConvention());
services.AddDbContext<AttendanceDbContext>(o => o.UseNpgsql(connStr).UseSnakeCaseNamingConvention());
services.AddDbContext<PayrollDbContext>(o => o.UseNpgsql(connStr).UseSnakeCaseNamingConvention());
services.AddDbContext<LmsDbContext>(o => o.UseNpgsql(connStr).UseSnakeCaseNamingConvention());
services.AddDbContext<NotificationDbContext>(o => o.UseNpgsql(connStr).UseSnakeCaseNamingConvention());
services.AddDbContext<WorkflowDbContext>(o => o.UseNpgsql(connStr).UseSnakeCaseNamingConvention());
services.AddDbContext<AuditDbContext>(o => o.UseNpgsql(connStr).UseSnakeCaseNamingConvention());
services.AddDbContext<ReportingDbContext>(o =>
    o.UseNpgsql(config.GetConnectionString("ReadReplica") ?? connStr)
     .UseSnakeCaseNamingConvention()
     .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking));
services.AddDbContext<BillingDbContext>(o => o.UseNpgsql(connStr).UseSnakeCaseNamingConvention());

// ─── Module Repositories & Services ──────────────────────────────────────────
services.AddScoped<ITenantRepository, TenantRepository>();
services.AddScoped<IUnitOfWorkTenant>(sp => sp.GetRequiredService<TenantRepository>());

services.AddScoped<IUserRepository, UserRepository>();
services.AddScoped<IUnitOfWorkIam>(sp => sp.GetRequiredService<UserRepository>());
services.AddScoped<IRoleRepository, RoleRepository>();

services.AddScoped<IEmployeeRepository, EmployeeRepository>();
services.AddScoped<IUnitOfWorkEmployee>(sp => sp.GetRequiredService<EmployeeRepository>());

services.AddScoped<ILeaveRepository, LeaveRepository>();
services.AddScoped<IUnitOfWorkLeave>(sp => sp.GetRequiredService<LeaveRepository>());

services.AddScoped<IAttendanceRepository, AttendanceRepository>();
services.AddScoped<IUnitOfWorkAttendance>(sp => sp.GetRequiredService<AttendanceRepository>());
services.AddScoped<IGeoFenceService, GeoFenceService>();

services.AddScoped<IPayrollRepository, PayrollRepository>();
services.AddScoped<IUnitOfWorkPayroll>(sp => sp.GetRequiredService<PayrollRepository>());
services.AddSingleton<PayrollFormulaEngine>();
services.AddSingleton<ICompliancePlugin, IndiaTaxPlugin>();

services.AddScoped<IOnboardingRepository, OnboardingRepository>();
services.AddScoped<IUnitOfWorkOnboarding>(sp => sp.GetRequiredService<OnboardingRepository>());

services.AddScoped<IWorkflowRepository, WorkflowRepository>();
services.AddScoped<IUnitOfWorkWorkflow>(sp => sp.GetRequiredService<WorkflowRepository>());

services.AddScoped<INotificationRepository, NotificationRepository>();
services.AddScoped<INotificationDispatcher, NotificationDispatcher>();

services.AddScoped<IAuditService, AuditService>();

services.AddScoped<ReportingQueryService>();
services.AddScoped<ITenantLookupService, TenantLookupService>();

// ─── MediatR — scans all module assemblies ────────────────────────────────────
services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssemblies(
        typeof(HRMSPlatform.Modules.TenantManagement.API.TenantsController).Assembly,
        typeof(HRMSPlatform.Modules.IAM.API.AuthController).Assembly,
        typeof(HRMSPlatform.Modules.EmployeeManagement.API.EmployeesController).Assembly,
        typeof(HRMSPlatform.Modules.Onboarding.API.OnboardingController).Assembly,
        typeof(HRMSPlatform.Modules.LeaveManagement.API.LeaveController).Assembly,
        typeof(HRMSPlatform.Modules.Attendance.API.AttendanceController).Assembly,
        typeof(HRMSPlatform.Modules.Payroll.API.PayrollController).Assembly,
        typeof(HRMSPlatform.Modules.LMS.API.LmsController).Assembly,
        typeof(HRMSPlatform.Modules.Notifications.API.NotificationsController).Assembly,
        typeof(HRMSPlatform.Modules.Workflow.API.WorkflowController).Assembly,
        typeof(HRMSPlatform.Modules.Billing.API.BillingController).Assembly
    );
});

// ─── FluentValidation ─────────────────────────────────────────────────────────
services.AddValidatorsFromAssemblies([
    typeof(HRMSPlatform.Modules.IAM.API.AuthController).Assembly,
    typeof(HRMSPlatform.Modules.EmployeeManagement.API.EmployeesController).Assembly,
    typeof(HRMSPlatform.Modules.LeaveManagement.API.LeaveController).Assembly,
    typeof(HRMSPlatform.Modules.Payroll.API.PayrollController).Assembly,
]);

// ─── JWT Authentication ────────────────────────────────────────────────────────
var jwtKey = Encoding.UTF8.GetBytes(config["Jwt:Secret"]!);
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opts =>
    {
        opts.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(jwtKey),
            ValidateIssuer = true,
            ValidIssuer = config["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = config["Jwt:Audience"],
            ClockSkew = TimeSpan.Zero
        };
        opts.Events = new JwtBearerEvents
        {
            OnTokenValidated = ctx =>
            {
                // Tenant context is set by TenantResolutionMiddleware after auth
                return Task.CompletedTask;
            }
        };
    });

// ─── Authorization Policies ───────────────────────────────────────────────────
services.AddAuthorization(opts =>
{
    opts.AddPolicy("PlatformAdmin", policy =>
        policy.RequireAuthenticatedUser().RequireRole("PLATFORM_ADMIN"));
    opts.AddPolicy("TenantAdmin", policy =>
        policy.RequireAuthenticatedUser().RequireRole("HR_ADMIN"));
    opts.AddPolicy("Payroll", policy =>
        policy.RequireAuthenticatedUser().RequireRole("PAYROLL_ADMIN", "HR_ADMIN"));
});

// ─── Controllers + API ────────────────────────────────────────────────────────
services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        opts.JsonSerializerOptions.DefaultIgnoreCondition =
            System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

services.AddEndpointsApiExplorer();
services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "HRMS Platform API",
        Version = "v1",
        Description = "Enterprise SaaS HRMS — Multi-tenant, Domain-Driven"
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// ─── Health checks ────────────────────────────────────────────────────────────
services.AddHealthChecks()
    .AddNpgSql(connStr, name: "postgres")
    .AddRedis(config.GetConnectionString("Redis") ?? "localhost:6379", name: "redis");

// ─── CORS ──────────────────────────────────────────────────────────────────────
services.AddCors(opts =>
{
    opts.AddPolicy("HrmsCors", policy =>
        policy.WithOrigins(config.GetSection("AllowedOrigins").Get<string[]>() ?? ["http://localhost:3000"])
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// ─── Build pipeline ───────────────────────────────────────────────────────────
var app = builder.Build();

// ─── Auto-migrate on startup (dev/staging only) ───────────────────────────────
if (app.Environment.IsDevelopment() || app.Environment.EnvironmentName == "Docker")
{
    await using var scope = app.Services.CreateAsyncScope();
    // Migrate each DbContext
    var contexts = new DbContext[]
    {
        scope.ServiceProvider.GetRequiredService<TenantDbContext>(),
        scope.ServiceProvider.GetRequiredService<IamDbContext>(),
        scope.ServiceProvider.GetRequiredService<EmployeeDbContext>(),
        scope.ServiceProvider.GetRequiredService<LeaveDbContext>(),
        scope.ServiceProvider.GetRequiredService<AttendanceDbContext>(),
        scope.ServiceProvider.GetRequiredService<PayrollDbContext>(),
        scope.ServiceProvider.GetRequiredService<LmsDbContext>(),
        scope.ServiceProvider.GetRequiredService<NotificationDbContext>(),
        scope.ServiceProvider.GetRequiredService<AuditDbContext>(),
        scope.ServiceProvider.GetRequiredService<BillingDbContext>(),
    };
    foreach (var ctx in contexts)
        await ctx.Database.MigrateAsync();
}

app.UseSerilogRequestLogging(opts =>
{
    opts.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
    {
        diagnosticContext.Set("TenantId", httpContext.Items["TenantId"]?.ToString() ?? "unknown");
        diagnosticContext.Set("RequestId", httpContext.TraceIdentifier);
    };
});

app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "HRMS API v1"));

app.UseHttpsRedirection();
app.UseCors("HrmsCors");

// Global exception handler
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

// Tenant resolution — must run after authentication so JWT claims are available
app.UseMiddleware<TenantResolutionMiddleware>();

// Audit middleware — logs every mutating request
app.UseMiddleware<AuditLoggingMiddleware>();

// Prometheus metrics
app.UseMetricServer();
app.UseHttpMetrics();

app.UseHealthChecks("/health");
app.UseHealthChecks("/health/ready");

app.MapControllers();

app.Run();
