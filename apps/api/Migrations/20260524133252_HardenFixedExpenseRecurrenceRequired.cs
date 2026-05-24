using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class HardenFixedExpenseRecurrenceRequired : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_fixed_expenses_recurrence_interval_positive",
                table: "fixed_expenses");

            migrationBuilder.DropCheckConstraint(
                name: "ck_fixed_expenses_recurrence_unit_valid",
                table: "fixed_expenses");

            migrationBuilder.AlterColumn<string>(
                name: "recurrence_unit",
                table: "fixed_expenses",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(10)",
                oldMaxLength: 10,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "recurrence_interval",
                table: "fixed_expenses",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateOnly>(
                name: "anchor_date",
                table: "fixed_expenses",
                type: "date",
                nullable: false,
                oldClrType: typeof(DateOnly),
                oldType: "date",
                oldNullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "ck_fixed_expenses_recurrence_interval_positive",
                table: "fixed_expenses",
                sql: "recurrence_interval > 0");

            migrationBuilder.AddCheckConstraint(
                name: "ck_fixed_expenses_recurrence_unit_valid",
                table: "fixed_expenses",
                sql: "recurrence_unit IN ('Day', 'Week', 'Month')");

            migrationBuilder.AddCheckConstraint(
                name: "ck_fixed_expenses_skip_until_after_anchor",
                table: "fixed_expenses",
                sql: "skip_until_date IS NULL OR skip_until_date >= anchor_date");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_fixed_expenses_recurrence_interval_positive",
                table: "fixed_expenses");

            migrationBuilder.DropCheckConstraint(
                name: "ck_fixed_expenses_recurrence_unit_valid",
                table: "fixed_expenses");

            migrationBuilder.DropCheckConstraint(
                name: "ck_fixed_expenses_skip_until_after_anchor",
                table: "fixed_expenses");

            migrationBuilder.AlterColumn<string>(
                name: "recurrence_unit",
                table: "fixed_expenses",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(10)",
                oldMaxLength: 10);

            migrationBuilder.AlterColumn<int>(
                name: "recurrence_interval",
                table: "fixed_expenses",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<DateOnly>(
                name: "anchor_date",
                table: "fixed_expenses",
                type: "date",
                nullable: true,
                oldClrType: typeof(DateOnly),
                oldType: "date");

            migrationBuilder.AddCheckConstraint(
                name: "ck_fixed_expenses_recurrence_interval_positive",
                table: "fixed_expenses",
                sql: "recurrence_interval IS NULL OR recurrence_interval > 0");

            migrationBuilder.AddCheckConstraint(
                name: "ck_fixed_expenses_recurrence_unit_valid",
                table: "fixed_expenses",
                sql: "recurrence_unit IS NULL OR recurrence_unit IN ('Day', 'Week', 'Month')");
        }
    }
}
