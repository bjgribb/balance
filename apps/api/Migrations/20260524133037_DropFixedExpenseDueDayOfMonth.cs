using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class DropFixedExpenseDueDayOfMonth : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "due_day_of_month",
                table: "fixed_expenses");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "due_day_of_month",
                table: "fixed_expenses",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
