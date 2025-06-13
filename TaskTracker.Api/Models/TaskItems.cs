namespace TaskTracker.Api.Models;

public class TaskItem
{
    public int Id { get; set; }          // ���������� �������������
    public string? Title { get; set; }    // �������� ������
    public string? Description { get; set; } // ��������� ��������
    public bool IsDone { get; set; }     // ������ ����������
    public DateTime CreatedAt { get; set; } = DateTime.Now; // ���� ��������
    public DateTime? DueDate { get; set; } // ���� ���������� (�������������� ����)
}