using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UserCrud.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToDoctor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_docters_UserId",
                table: "docters",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_docters_AbpUsers_UserId",
                table: "docters",
                column: "UserId",
                principalTable: "AbpUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_docters_AbpUsers_UserId",
                table: "docters");

            migrationBuilder.DropIndex(
                name: "IX_docters_UserId",
                table: "docters");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "docters");
        }
    }
}
