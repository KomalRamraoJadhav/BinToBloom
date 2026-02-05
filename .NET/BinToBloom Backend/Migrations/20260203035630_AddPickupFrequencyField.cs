using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BinToBloom_Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPickupFrequencyField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "pickup_frequency",
                table: "PickupRequests",
                type: "varchar(10)",
                maxLength: 10,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "pickup_frequency",
                table: "PickupRequests");
        }
    }
}
