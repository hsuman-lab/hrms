namespace HRMSPlatform.SharedKernel.Common;

public sealed record Error(string Code, string Description)
{
    public static readonly Error None = new(string.Empty, string.Empty);
    public static readonly Error NotFound = new("NOT_FOUND", "The requested resource was not found.");
    public static readonly Error Unauthorized = new("UNAUTHORIZED", "You are not authorized to perform this action.");
    public static readonly Error Forbidden = new("FORBIDDEN", "Access denied.");
    public static readonly Error Conflict = new("CONFLICT", "A conflict occurred with the current state.");
    public static readonly Error Validation = new("VALIDATION", "One or more validation errors occurred.");
    public static readonly Error Internal = new("INTERNAL", "An internal error occurred.");

    public static Error Custom(string code, string description) => new(code, description);
}
