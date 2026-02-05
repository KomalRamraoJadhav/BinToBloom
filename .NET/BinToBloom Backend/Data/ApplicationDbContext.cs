using Microsoft.EntityFrameworkCore;
using BinToBloom_Backend.Models.Entities;

namespace BinToBloom_Backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Role> Roles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<HouseholdDetail> HouseholdDetails { get; set; }
        public DbSet<BusinessDetail> BusinessDetails { get; set; }
        public DbSet<Collector> Collectors { get; set; }
        public DbSet<PickupRequest> PickupRequests { get; set; }
        public DbSet<WasteLog> WasteLogs { get; set; }
        public DbSet<TrackingLog> TrackingLogs { get; set; }
        public DbSet<EcoReward> EcoRewards { get; set; }
        public DbSet<Leaderboard> Leaderboard { get; set; }
        public DbSet<NGO> NGOs { get; set; }
        public DbSet<NGOReport> NGOReports { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Contact> Contacts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure relationships and constraints
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<HouseholdDetail>()
                .HasOne(h => h.User)
                .WithOne(u => u.HouseholdDetail)
                .HasForeignKey<HouseholdDetail>(h => h.UserId);

            modelBuilder.Entity<BusinessDetail>()
                .HasOne(b => b.User)
                .WithOne(u => u.BusinessDetail)
                .HasForeignKey<BusinessDetail>(b => b.UserId);

            modelBuilder.Entity<Collector>()
                .HasOne(c => c.User)
                .WithOne(u => u.Collector)
                .HasForeignKey<Collector>(c => c.UserId);

            modelBuilder.Entity<NGO>()
                .HasOne(n => n.User)
                .WithOne(u => u.NGO)
                .HasForeignKey<NGO>(n => n.UserId);

            modelBuilder.Entity<Admin>()
                .HasOne(a => a.User)
                .WithOne(u => u.Admin)
                .HasForeignKey<Admin>(a => a.UserId);
        }
    }
}