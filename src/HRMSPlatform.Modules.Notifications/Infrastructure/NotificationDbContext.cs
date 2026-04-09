using HRMSPlatform.Modules.Notifications.Domain;
using Microsoft.EntityFrameworkCore;

namespace HRMSPlatform.Modules.Notifications.Infrastructure;

public class NotificationDbContext(DbContextOptions<NotificationDbContext> options) : DbContext(options)
{
    public DbSet<NotificationTemplate> Templates => Set<NotificationTemplate>();
    public DbSet<NotificationMessage> Messages => Set<NotificationMessage>();
    public DbSet<UserNotificationPreference> Preferences => Set<UserNotificationPreference>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<NotificationTemplate>(b =>
        {
            b.ToTable("notification_templates");
            b.HasKey(x => x.Id);
            b.Property(x => x.EventType).HasMaxLength(100);
            b.Property(x => x.Channel).HasConversion<string>().HasMaxLength(20);
            b.HasIndex(x => new { x.TenantId, x.EventType, x.Channel });
        });

        mb.Entity<NotificationMessage>(b =>
        {
            b.ToTable("notification_messages");
            b.HasKey(x => x.Id);
            b.Property(x => x.Channel).HasConversion<string>().HasMaxLength(20);
            b.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            b.HasIndex(x => new { x.TenantId, x.RecipientId, x.Status });
        });

        mb.Entity<UserNotificationPreference>(b =>
        {
            b.ToTable("notification_preferences");
            b.HasKey(x => x.Id);
            b.HasIndex(x => new { x.UserId, x.EventType, x.Channel }).IsUnique();
        });
    }
}
