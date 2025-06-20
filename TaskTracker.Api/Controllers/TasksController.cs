using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskTracker.Api.Models;
using TaskTracker.Api.Data;

namespace TaskTracker.Api.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _db; // ������ _tasks

    public TasksController(AppDbContext db)
    {
        _db = db; // �������� �������� ��
    }

        // GET: api/tasks
        [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetAllTasks()
    {
        return await _db.Tasks.OrderBy(t => t.Id).ToListAsync();
    }

    // GET: api/tasks/id
    [HttpGet("{id}")]
    public async Task<ActionResult<TaskItem>> GetTask(int id)
    {
        var task = await _db.Tasks.FindAsync(id);

        if (task == null)
        {
            return NotFound();
        }

        return Ok(task);
    }

    // POST: api/tasks
    [HttpPost]
    public async Task<ActionResult<TaskItem>> CreateTask([FromBody] TaskItem task)
    {
        if (task.DueDate.HasValue && task.DueDate < DateTime.Now)
        {
            return BadRequest("���� ���������� �� ����� ���� � �������");
        }

        task.CreatedAt = DateTime.Now;
        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
    }

    // PUT: api/tasks/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int id, [FromBody] TaskItem updatedTask)
    {
        if (id <= 0)
            return BadRequest("ID ������ ���� ������ 0!");

        // ������� ������ � ��
        var existingTask = await _db.Tasks.FindAsync(id);
        if (existingTask == null)
            return NotFound();

        // ��������� ���� (����� Id � CreatedAt)
        existingTask.Title = updatedTask.Title ?? existingTask.Title;
        existingTask.Description = updatedTask.Description ?? existingTask.Description;
        existingTask.IsDone = updatedTask.IsDone;
        existingTask.DueDate = updatedTask.DueDate;

        // ��������� ���������
        await _db.SaveChangesAsync();

        return Ok(existingTask);
    }

    // DELETE: api/tasks/id
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        //�������� id
        if (id <= 0)
            return BadRequest("ID ������ ���� ������ 0!");

        var task = await _db.Tasks.FindAsync(id);
        if (task == null)
        {
            return NotFound();
        }

        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();

        return NoContent();
    } 
    
}