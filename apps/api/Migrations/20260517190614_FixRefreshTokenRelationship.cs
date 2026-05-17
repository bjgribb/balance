using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class FixRefreshTokenRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_refresh_tokens_asp_net_users_application_user_id",
                table: "refresh_tokens");

            migrationBuilder.DropIndex(
                name: "ix_refresh_tokens_application_user_id",
                table: "refresh_tokens");

            migrationBuilder.DropColumn(
                name: "application_user_id",
                table: "refresh_tokens");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "application_user_id",
                table: "refresh_tokens",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_refresh_tokens_application_user_id",
                table: "refresh_tokens",
                column: "application_user_id");

            migrationBuilder.AddForeignKey(
                name: "fk_refresh_tokens_asp_net_users_application_user_id",
                table: "refresh_tokens",
                column: "application_user_id",
                principalTable: "AspNetUsers",
                principalColumn: "id");
        }
    }
}
