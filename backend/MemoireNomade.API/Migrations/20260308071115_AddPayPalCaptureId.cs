using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MemoireNomade.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPayPalCaptureId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PayPalCaptureId",
                table: "Payments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AdminUsers",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAELTURrhzyrBfGn1RE5oicyzCVr5ra7T9pCTgUc74V/7CFT/SGfYcxeWF4OXroVs9tg==");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PayPalCaptureId",
                table: "Payments");

            migrationBuilder.UpdateData(
                table: "AdminUsers",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAEOefahXJQCUPJ+JMv4X/kv2yegUwH39XToZMBaNumu7VsU9mpJKhriqvs/2Cic9u9g==");
        }
    }
}
