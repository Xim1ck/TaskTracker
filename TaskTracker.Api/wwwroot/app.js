document.addEventListener('DOMContentLoaded', function () {
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const descriptionInput = document.getElementById('descriptionInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const taskList = document.getElementById('taskList');
    const refreshBtn = document.getElementById('refreshBtn');

    // 1. Улучшенная функция загрузки задач
    async function loadTasks() {
        try {
            showLoadingIndicator();

            const response = await fetch('/api/tasks');

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Ошибка сервера');
            }

            const tasks = await response.json();

            if (!Array.isArray(tasks)) {
                throw new Error('Некорректный формат данных');
            }

            renderTasks(tasks);

        } catch (error) {
            console.error('Ошибка загрузки:', error);
            showError(`Ошибка загрузки задач: ${error.message}`);
        }
    }

    // 2. Улучшенный рендеринг задач
    function renderTasks(tasks) {
        console.log('Полученные задачи:', tasks); // Логирование для отладки

        taskList.innerHTML = '';

        if (tasks.length === 0) {
            taskList.innerHTML = '<div class="alert alert-info">Нет задач</div>';
            return;
        }

        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `list-group-item ${task.IsDone ? 'task-completed' : ''}`;

            taskElement.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 class="mb-1">${escapeHtml(task.Title || 'Без названия')}</h5>
                        ${task.Description ? `<p class="mb-1">${escapeHtml(task.Description)}</p>` : ''}
                        <small class="text-muted">Создано: ${formatDate(task.CreatedAt)}</small>
                        ${task.DueDate ? `<br><small class="task-due-date">Срок: ${formatDate(task.DueDate)}</small>` : ''}
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-sm ${task.IsDone ? 'btn-success' : 'btn-outline-secondary'}" 
                                data-id="${task.Id}" data-action="toggle">
                            ${task.IsDone ? '✓' : 'Отметить'}
                        </button>
                        <button class="btn btn-danger btn-sm" 
                                data-id="${task.Id}" data-action="delete">
                            Удалить
                        </button>
                    </div>
                </div>
            `;

            taskList.appendChild(taskElement);
        });

        // Назначение обработчиков событий
        setupEventListeners();
    }

    // 3. Обработчики событий
    function setupEventListeners() {
        // Удаление задачи
        document.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', async function () {
                if (confirm('Удалить задачу?')) {
                    await deleteTask(this.dataset.id);
                }
            });
        });

        // Переключение статуса
        document.querySelectorAll('[data-action="toggle"]').forEach(btn => {
            btn.addEventListener('click', async function () {
                await toggleTask(this.dataset.id);
            });
        });
    }

    // 4. Основные операции с задачами
    async function addTask(title, description, dueDate) {
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify({
                    Title: title,
                    Description: description,
                    DueDate: dueDate,
                    IsDone: false
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Ошибка сервера');
            }

            return await response.json();

        } catch (error) {
            console.error('Ошибка добавления:', error);
            throw error;
        }
    }

    async function deleteTask(id) {
        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Ошибка сервера');
            }

            await loadTasks();

        } catch (error) {
            console.error('Ошибка удаления:', error);
            alert('Не удалось удалить задачу');
        }
    }

    async function toggleTask(id) {
        try {
            const response = await fetch(`/api/tasks/${id}/toggle`, {
                method: 'PUT'
            });

            if (!response.ok) {
                throw new Error('Ошибка сервера');
            }

            await loadTasks();

        } catch (error) {
            console.error('Ошибка переключения:', error);
            alert('Не удалось изменить статус');
        }
    }

    // 5. Вспомогательные функции
    function showLoadingIndicator() {
        taskList.innerHTML = `
            <div class="text-center py-3">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Загрузка...</span>
                </div>
            </div>
        `;
    }

    function showError(message) {
        taskList.innerHTML = `
            <div class="alert alert-danger">
                ${escapeHtml(message)}
                <button class="btn btn-sm btn-outline-secondary mt-2" onclick="location.reload()">
                    Обновить страницу
                </button>
            </div>
        `;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatDate(dateString) {
        if (!dateString) return 'Нет срока';
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime())
                ? 'Некорректная дата'
                : date.toLocaleString('ru-RU');
        } catch {
            return 'Некорректная дата';
        }
    }

    // 6. Инициализация
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = taskInput.value.trim();
        const description = descriptionInput.value.trim();
        const dueDate = dueDateInput.value;

        if (!title) {
            alert('Введите название задачи');
            return;
        }

        try {
            await addTask(title, description, dueDate);
            taskForm.reset();
            await loadTasks();
        } catch (error) {
            alert(`Ошибка: ${error.message}`);
        }
    });

    refreshBtn?.addEventListener('click', loadTasks);

    // Первоначальная загрузка
    loadTasks();
});