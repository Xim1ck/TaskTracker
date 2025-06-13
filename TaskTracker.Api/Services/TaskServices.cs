using TaskTracker.Api.Models;
using System.Collections.Concurrent;

namespace TaskTracker.Api.Services;

public class TaskService
{
    private readonly ConcurrentDictionary<int, TaskItem> _tasks = new();

    public TaskItem AddTask(TaskItem task)
    {
        task.Id = _tasks.Any() ? _tasks.Keys.Max() + 1 : 1;
        _tasks[task.Id] = task;
        return task;
    }

    public List<TaskItem> GetAllTasks() => _tasks.Values.ToList();

    public TaskItem? GetTaskById(int id) => _tasks.GetValueOrDefault(id);

    public void DeleteTask(int id) => _tasks.TryRemove(id, out _);
}