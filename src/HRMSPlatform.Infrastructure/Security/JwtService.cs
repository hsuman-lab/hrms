using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace HRMSPlatform.Infrastructure.Security;

public sealed class JwtService(IConfiguration config)
{
    private readonly string _secret = config["Jwt:Secret"] ?? throw new ArgumentNullException("Jwt:Secret");
    private readonly string _issuer = config["Jwt:Issuer"] ?? "https://hrms.io";
    private readonly string _audience = config["Jwt:Audience"] ?? "hrms-clients";
    private readonly int _accessTokenMinutes = int.Parse(config["Jwt:AccessTokenMinutes"] ?? "15");
    private readonly int _refreshTokenDays = int.Parse(config["Jwt:RefreshTokenDays"] ?? "7");

    public string GenerateAccessToken(Guid userId, Guid tenantId, string tenantSlug, string[] roles, string[] permissions)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var jti = Guid.NewGuid().ToString();

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub,  userId.ToString()),
            new(JwtRegisteredClaimNames.Jti,  jti),
            new("tid",                        tenantId.ToString()),
            new("tslug",                      tenantSlug),
        };

        foreach (var role in roles) claims.Add(new Claim(ClaimTypes.Role, role));
        foreach (var perm in permissions) claims.Add(new Claim("permission", perm));

        var token = new JwtSecurityToken(
            issuer:   _issuer,
            audience: _audience,
            claims:   claims,
            notBefore: DateTime.UtcNow,
            expires:   DateTime.UtcNow.AddMinutes(_accessTokenMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

    public ClaimsPrincipal? ValidateToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        try
        {
            return tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = key,
                ValidateIssuer = true,
                ValidIssuer = _issuer,
                ValidateAudience = true,
                ValidAudience = _audience,
                ClockSkew = TimeSpan.Zero
            }, out _);
        }
        catch { return null; }
    }

    public SymmetricSecurityKey GetSecurityKey() =>
        new(Encoding.UTF8.GetBytes(_secret));
}
