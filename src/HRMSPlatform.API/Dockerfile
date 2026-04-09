# ─── Build stage ──────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy all projects
COPY src/ ./src/

# Restore NuGet packages
WORKDIR /app/src/HRMSPlatform.API
RUN dotnet restore

# Build and publish
RUN dotnet publish -c Release -o /publish --no-restore

# ─── Runtime stage ────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Non-root user for security
RUN addgroup --system hrms && adduser --system --ingroup hrms hrms
USER hrms

COPY --from=build /publish .

EXPOSE 8080
EXPOSE 8081

ENTRYPOINT ["dotnet", "HRMSPlatform.API.dll"]
