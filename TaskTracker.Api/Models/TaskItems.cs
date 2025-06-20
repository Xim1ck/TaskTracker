using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace TaskTracker.Api.Models;

public class TaskItem
{
    [Key] // Указывает, что это первичный ключ
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)] // Автоинкремент
    public int Id { get; set; }          // Уникальный идентификатор

    public string? Title { get; set; }    // Название задачи
    public string? Description { get; set; } // Подробное описание
    public bool IsDone { get; set; }     // Статус выполнения
    public DateTime CreatedAt { get; set; } = DateTime.Now; // Дата создания
    public DateTime? DueDate { get; set; } // Срок выполнения (необязательное поле)
}