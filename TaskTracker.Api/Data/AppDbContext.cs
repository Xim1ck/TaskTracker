using Microsoft.EntityFrameworkCore;
using TaskTracker.Api.Models;

namespace TaskTracker.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {

        Database.EnsureCreated(); // ������ �� ��� ������ ���������, ���� � ���

    }

    public DbSet<TaskItem> Tasks { get; set; } // ������� ��� �����
}