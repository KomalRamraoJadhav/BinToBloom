using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BinToBloom_Backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePickupRequestSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "latitude",
                table: "PickupRequests",
                type: "decimal(10,8)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "longitude",
                table: "PickupRequests",
                type: "decimal(11,8)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "notes",
                table: "PickupRequests",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "latitude",
                table: "PickupRequests");

            migrationBuilder.DropColumn(
                name: "longitude",
                table: "PickupRequests");

            migrationBuilder.DropColumn(
                name: "notes",
                table: "PickupRequests");
        }
    }
}
