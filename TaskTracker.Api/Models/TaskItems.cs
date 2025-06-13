namespace TaskTracker.Api.Models;

public class TaskItem
{
    public int Id { get; set; }          // Уникальный идентификатор
    public string? Title { get; set; }    // Название задачи
    public string? Description { get; set; } // Подробное описание
    public bool IsDone { get; set; }     // Статус выполнения
    public DateTime CreatedAt { get; set; } = DateTime.Now; // Дата создания
    public DateTime? DueDate { get; set; } // Срок выполнения (необязательное поле)
}