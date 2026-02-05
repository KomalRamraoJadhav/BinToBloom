using Microsoft.EntityFrameworkCore;
using BinToBloom_Backend.Models.Entities;
using BCrypt.Net;

namespace BinToBloom_Backend.Data
{
    public static class DatabaseSeeder
    {
        public static async Task SeedRolesAsync(ApplicationDbContext context)
        {
            if (context.Roles.Any())
                return;

            var roles = new[]
            {
                new Role { RoleName = "HOUSEHOLD" },
                new Role { RoleName = "BUSINESS" },
                new Role { RoleName = "COLLECTOR" },
                new Role { RoleName = "NGO" },
                new Role { RoleName = "ADMIN" }
            };

            context.Roles.AddRange(roles);
            await context.SaveChangesAsync();
        }

        public static async Task SeedAdminUserAsync(ApplicationDbContext context)
        {
            // Check if admin user already exists
            var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.RoleName == "ADMIN");
            if (adminRole == null) return;

            var adminEmail = "admin@bintobloom.com";
            if (await context.Users.AnyAsync(u => u.Email == adminEmail))
                return;

            // Create default admin user
            var adminUser = new User
            {
                Name = "System Administrator",
                Email = adminEmail,
                Password = BCrypt.Net.BCrypt.HashPassword("Admin@123"), // Default password
                Phone = "+911234567890",
                Address = "BinToBloom Headquarters",
                City = "Mumbai",
                RoleId = adminRole.RoleId,
                Status = "ACTIVE",
                CreatedAt = DateTime.Now
            };

            context.Users.Add(adminUser);
            await context.SaveChangesAsync();

            // Create admin detail
            context.Admins.Add(new Admin { UserId = adminUser.UserId });
            await context.SaveChangesAsync();
        }
    }
}

