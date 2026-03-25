using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UserCrud.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToDoctor : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ✅ Step 1: Add column first
            migrationBuilder.AddColumn<long>(
                name: "UserId",
                table: "docters",
                nullable: false,
                defaultValue: 0L); // or nullable: true if optional

            // ✅ Step 2: Create index
            migrationBuilder.CreateIndex(
                name: "IX_docters_UserId",
                table: "docters",
                column: "UserId");

            // ✅ Step 3: Add foreign key
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
