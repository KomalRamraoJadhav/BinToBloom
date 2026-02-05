using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BinToBloom_Backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePaymentSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "payment_mode",
                table: "Payments",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(20)",
                oldMaxLength: 20)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "pickup_request_id",
                table: "Payments",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "razorpay_order_id",
                table: "Payments",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "razorpay_payment_id",
                table: "Payments",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "razorpay_signature",
                table: "Payments",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "user_id",
                table: "Payments",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Payments_pickup_request_id",
                table: "Payments",
                column: "pickup_request_id");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_user_id",
                table: "Payments",
                column: "user_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_PickupRequests_pickup_request_id",
                table: "Payments",
                column: "pickup_request_id",
                principalTable: "PickupRequests",
                principalColumn: "pickup_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_Users_user_id",
                table: "Payments",
                column: "user_id",
                principalTable: "Users",
                principalColumn: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Payments_PickupRequests_pickup_request_id",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Users_user_id",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_Payments_pickup_request_id",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_Payments_user_id",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "pickup_request_id",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "razorpay_order_id",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "razorpay_payment_id",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "razorpay_signature",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "Payments");

            migrationBuilder.AlterColumn<string>(
                name: "payment_mode",
                table: "Payments",
                type: "varchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");
        }
    }
}
