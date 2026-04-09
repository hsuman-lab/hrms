using System.Text.Json;
using HRMSPlatform.SharedKernel.Domain;
using Microsoft.AspNetCore.Mvc;

namespace HRMSPlatform.API.Middleware;

public sealed class ExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (DomainException ex)
        {
            logger.LogWarning("Domain exception: {Code} — {Message}", ex.Code, ex.Message);
            await WriteErrorAsync(context, StatusCodes.Status422UnprocessableEntity,
                ex.Code ?? "DOMAIN_ERROR", ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            logger.LogWarning("Unauthorized: {Message}", ex.Message);
            await WriteErrorAsync(context, StatusCodes.Status401Unauthorized, "UNAUTHORIZED", ex.Message);
        }
        catch (Exception ex)
        {
            var correlationId = context.TraceIdentifier;
            logger.LogError(ex, "Unhandled exception {CorrelationId}", correlationId);
            await WriteErrorAsync(context, StatusCodes.Status500InternalServerError,
                "INTERNAL_ERROR", "An unexpected error occurred.", correlationId);
        }
    }

    private static async Task WriteErrorAsync(
        HttpContext context, int statusCode, string code,
        string message, string? correlationId = null)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = code,
            Detail = message,
            Extensions = { ["correlationId"] = correlationId ?? context.TraceIdentifier }
        };

        await context.Response.WriteAsJsonAsync(problemDetails);
    }
}
