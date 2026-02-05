using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BinToBloom_Backend.Migrations
{
    /// <inheritdoc />
    public partial class MakePaymentBusinessIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "business_id",
                table: "Payments",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_BusinessDetails_business_id",
                table: "Payments",
                column: "business_id",
                principalTable: "BusinessDetails",
                principalColumn: "business_id");
        }


        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Payments_BusinessDetails_business_id",
                table: "Payments");

            migrationBuilder.AlterColumn<int>(
                name: "business_id",
                table: "Payments",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_BusinessDetails_business_id",
                table: "Payments",
                column: "business_id",
                principalTable: "BusinessDetails",
                principalColumn: "business_id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
