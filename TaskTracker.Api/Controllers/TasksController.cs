using Microsoft.AspNetCore.Mvc;
using System.Collections.Concurrent;
using TaskTracker.Api.Models;

namespace TaskTracker.Api.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    // Временное хранилище задач (замените на реальную БД позже)
    private static readonly ConcurrentDictionary<int, TaskItem> _tasks = new();
    private static int _nextId = 1;

    // GET: api/tasks
    [HttpGet]
    public ActionResult<IEnumerable<TaskItem>> GetAllTasks()
    {
        return Ok(_tasks.Values.OrderBy(t => t.Id));
    }

    // GET: api/tasks/5
    [HttpGet("{id}")]
    public ActionResult<TaskItem> GetTask(int id)
    {
        if (!_tasks.TryGetValue(id, out var task))
        {
            return NotFound();
        }
        return Ok(task);
    }

    // POST: api/tasks
    [HttpPost]
    public ActionResult<TaskItem> CreateTask([FromBody] TaskItem task)
    {
        task.Id = _nextId++;
        task.CreatedAt = DateTime.Now;
        _tasks[task.Id] = task;

        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
    }

    // DELETE: api/tasks/5
    [HttpDelete("{id}")]
    public IActionResult DeleteTask(int id)
    {
        if (!_tasks.TryRemove(id, out _))
        {
            return NotFound();
        }
        return NoContent();
    }
}