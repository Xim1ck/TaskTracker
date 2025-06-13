using TaskTracker.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddSingleton<TaskService>();  // <-- Регистрация вашего сервиса
builder.Services.AddControllers();            // <-- Добавьте эту строку для поддержки контроллеров
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

app.MapControllers();  // <-- Добавьте эту строку для маршрутизации контроллеров

app.Run();