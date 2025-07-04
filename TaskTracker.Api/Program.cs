using TaskTracker.Api.Services;
using TaskTracker.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=tasks.db"));
builder.Services.AddSingleton<TaskService>();  // <-- ����������� ������ �������
builder.Services.AddControllers();            // <-- �������� ��� ������ ��� ��������� ������������
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();

app.MapControllers();  // <-- �������� ��� ������ ��� ������������� ������������
app.UseDefaultFiles();
app.UseStaticFiles();

app.Run();