using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace TaskTracker.Api.Models;

public class TaskItem
{
    [Key] // ���������, ��� ��� ��������� ����
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)] // �������������
    public int Id { get; set; }          // ���������� �������������

    public string? Title { get; set; }    // �������� ������
    public string? Description { get; set; } // ��������� ��������
    public bool IsDone { get; set; }     // ������ ����������
    public DateTime CreatedAt { get; set; } = DateTime.Now; // ���� ��������
    public DateTime? DueDate { get; set; } // ���� ���������� (�������������� ����)
}