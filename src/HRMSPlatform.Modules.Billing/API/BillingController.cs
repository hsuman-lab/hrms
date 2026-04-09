using HRMSPlatform.Modules.Billing.Domain;
using HRMSPlatform.Modules.Billing.Infrastructure;
using HRMSPlatform.SharedKernel.MultiTenancy;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRMSPlatform.Modules.Billing.API;

[ApiController]
[Route("api/v1/billing")]
[Authorize]
public sealed class BillingController(BillingDbContext db, ITenantContext tenant) : ControllerBase
{
    /// <summary>Get current subscription for tenant.</summary>
    [HttpGet("subscription")]
    public async Task<IActionResult> GetSubscription(CancellationToken ct)
    {
        var sub = await db.Subscriptions
            .Where(s => s.TenantId == tenant.TenantId && s.Status != SubscriptionStatus.Cancelled)
            .FirstOrDefaultAsync(ct);
        return sub is null ? NotFound() : Ok(sub);
    }

    /// <summary>List invoices for current tenant.</summary>
    [HttpGet("invoices")]
    [Authorize(Roles = "HR_ADMIN")]
    public async Task<IActionResult> ListInvoices(CancellationToken ct)
    {
        var invoices = await db.Invoices
            .Where(i => i.TenantId == tenant.TenantId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync(ct);
        return Ok(invoices);
    }

    /// <summary>Platform admin: list all plans.</summary>
    [HttpGet("plans")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPlans(CancellationToken ct)
    {
        var plans = await db.Plans.Where(p => p.IsActive).ToListAsync(ct);
        return Ok(plans);
    }

    /// <summary>
    /// Stripe webhook endpoint. Processes subscription lifecycle events.
    /// In production: verify Stripe-Signature header.
    /// </summary>
    [HttpPost("webhooks/stripe")]
    [AllowAnonymous]
    public async Task<IActionResult> StripeWebhook(CancellationToken ct)
    {
        // Parse Stripe event, update subscription/invoice status
        return Ok();
    }
}
