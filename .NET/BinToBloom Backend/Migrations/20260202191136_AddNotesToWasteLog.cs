using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BinToBloom_Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddNotesToWasteLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "notes",
                table: "WasteLogs",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "notes",
                table: "WasteLogs");
        }
    }
}
