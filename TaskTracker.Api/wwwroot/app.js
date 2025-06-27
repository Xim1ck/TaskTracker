document.addEventListener('DOMContentLoaded', function () {
    // Элементы интерфейса
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const descriptionInput = document.getElementById('descriptionInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const taskList = document.getElementById('taskList');
    const refreshBtn = document.getElementById('refreshBtn');
    const filterButtons = document.querySelectorAll('.filter-btn');

        // Элементы интерфейса
        const elements = {
            form: document.getElementById('taskForm'),
            input: document.getElementById('taskInput'),
            description: document.getElementById('descriptionInput'),
            dueDate: document.getElementById('dueDateInput'),
            taskList: document.getElementById('taskList'),
            refreshBtn: document.getElementById('refreshBtn'),
            filterButtons: document.querySelectorAll('.filter-btn')
        };

        // Состояние приложения
        const state = {
            mode: 'add',
            currentTaskId: null,
            filter: 'all',
            tasks: [],
            isLoading: false
        };

        // Инициализация
        init();

        function init() {
            setupEventListeners();
            loadTasks();
        }

        // 1. Загрузка задач
        async function loadTasks() {
            try {
                setLoading(true);

                const response = await fetch('/api/tasks');

                if (!response.ok) {
                    throw new Error(`Ошибка загрузки: ${response.status}`);
                }

                state.tasks = await response.json();
                renderTasks();

            } catch (error) {
                showError(error.message);
                console.error('Ошибка:', error);
            } finally {
                setLoading(false);
            }
        }

        // 2. Рендеринг задач
        function renderTasks() {
            // Фильтрация
            const filteredTasks = filterTasks(state.tasks, state.filter);

            // Очистка списка
            elements.taskList.innerHTML = '';

            // Пустое состояние
            if (filteredTasks.length === 0) {
                showEmptyState();
                return;
            }

            // Рендеринг задач
            filteredTasks.forEach((task, index) => {
                const taskElement = createTaskElement(task);
                elements.taskList.appendChild(taskElement);

                // Анимация появления
                setTimeout(() => {
                    taskElement.classList.add('fade-in');
                }, index * 50);
            });
        }

        function createTaskElement(task) {
            const taskEl = document.createElement('div');
            taskEl.className = `task-card p-3 mb-3 ${task.isDone ? 'task-completed' : ''}`;

            const dueDateBadge = task.dueDate
                ? `<span class="badge badge-due me-2">
                  <i class="bi bi-calendar"></i> ${formatDate(task.dueDate)}
               </span>`
                : '';

            const statusBadge = task.isDone
                ? `<span class="badge badge-completed me-2">
                  <i class="bi bi-check2"></i> Завершено
               </span>`
                : '';

            taskEl.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <div class="d-flex align-items-center mb-1">
                        <h5 class="task-title mb-0 me-2">${escapeHtml(task.title)}</h5>
                        ${statusBadge}
                        ${dueDateBadge}
                    </div>
                    ${task.description
                    ? `<p class="task-description mb-2">${escapeHtml(task.description)}</p>`
                    : ''}
                    <small class="task-meta">
                        <i class="bi bi-clock"></i> Создано: ${formatDate(task.createdAt)}
                    </small>
                </div>
                <div class="btn-group ms-3">
                    <button class="btn btn-sm ${task.isDone ? 'btn-success' : 'btn-outline-secondary'}" 
                            data-id="${task.id}" data-action="complete">
                        <i class="bi ${task.isDone ? 'bi-check2-all' : 'bi-check2'}"></i>
                    </button>
                    <button class="btn btn-outline-primary btn-sm" 
                            data-id="${task.id}" data-action="edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" 
                            data-id="${task.id}" data-action="delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;

            return taskEl;
        }

        // 3. Фильтрация задач
        function filterTasks(tasks, filter) {
            switch (filter) {
                case 'active':
                    return tasks.filter(task => !task.isDone);
                case 'completed':
                    return tasks.filter(task => task.isDone);
                default:
                    return [...tasks];
            }
        }

        // 4. Обработчики событий
        function setupEventListeners() {
            // Фильтры
            elements.filterButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    elements.filterButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    state.filter = btn.dataset.filter;
                    renderTasks();
                });
            });

            // Форма
            elements.form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await handleFormSubmit();
            });

            // Обновление
            elements.refreshBtn.addEventListener('click', loadTasks);

            // Глобальный делегированный обработчик
            elements.taskList.addEventListener('click', async (e) => {
                const actionBtn = e.target.closest('[data-action]');
                if (!actionBtn) return;

                const action = actionBtn.dataset.action;
                const taskId = actionBtn.dataset.id;

                try {
                    switch (action) {
                        case 'complete':
                            await toggleTaskStatus(taskId);
                            break;
                        case 'edit':
                            openEditForm(taskId);
                            break;
                        case 'delete':
                            if (confirm('Удалить задачу?')) {
                                await deleteTask(taskId);
                            }
                            break;
                    }
                } catch (error) {
                    showError(error.message);
                }
            });
        }

        // 5. Обработка формы
        async function handleFormSubmit() {
            const title = elements.input.value.trim();
            if (!title) {
                showAlert('Введите название задачи', 'warning');
                return;
            }

            const taskData = {
                title: title,
                description: elements.description.value.trim(),
                dueDate: elements.dueDate.value || null,
                isDone: false
            };

            try {
                if (state.mode === 'add') {
                    await addTask(taskData);
                    showAlert('Задача добавлена', 'success');
                } else {
                    await updateTask(state.currentTaskId, taskData);
                    showAlert('Задача обновлена', 'success');
                    resetForm();
                }

                await loadTasks();

            } catch (error) {
                showError(error.message);
            }
        }

        // 6. Операции с задачами
        async function addTask(taskData) {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                throw new Error('Не удалось добавить задачу');
            }

            resetForm();
        }

        async function updateTask(id, taskData) {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                throw new Error('Не удалось обновить задачу');
            }

            resetForm();
        }

        async function deleteTask(id) {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Не удалось удалить задачу');
            }

            await loadTasks();
            showAlert('Задача удалена', 'info');
        }

        async function toggleTaskStatus(id) {
            const task = state.tasks.find(t => t.id == id);
            if (!task) return;

            const response = await fetch(`/api/tasks/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isDone: !task.isDone })
            });

            if (!response.ok) {
                throw new Error('Не удалось изменить статус');
            }

            await loadTasks();
        }

        // 7. Режим редактирования
        function openEditForm(taskId) {
            const task = state.tasks.find(t => t.id == taskId);
            if (!task) return;

            elements.input.value = task.title || '';
            elements.description.value = task.description || '';
            elements.dueDate.value = task.dueDate ? formatDateForInput(task.dueDate) : '';

            state.mode = 'edit';
            state.currentTaskId = taskId;

            // Прокрутка к форме
            elements.form.scrollIntoView({ behavior: 'smooth' });
            elements.input.focus();
        }

        function resetForm() {
            elements.form.reset();
            state.mode = 'add';
            state.currentTaskId = null;
        }

        // 8. Вспомогательные функции
        function setLoading(isLoading) {
            state.isLoading = isLoading;
            elements.refreshBtn.innerHTML = isLoading
                ? `<span class="loading-spinner"><i class="bi bi-arrow-repeat"></i></span> Загрузка...`
                : `<i class="bi bi-arrow-clockwise"></i> Обновить`;

            if (isLoading) {
                elements.taskList.innerHTML = `
                <div class="text-center py-4">
                    <div class="loading-spinner">
                        <i class="bi bi-arrow-repeat"></i>
                    </div>
                    <p class="mt-2">Загрузка задач...</p>
                </div>
            `;
            }
        }

        function showEmptyState() {
            let message, icon;

            switch (state.filter) {
                case 'active':
                    message = 'Нет активных задач';
                    icon = 'bi-emoji-smile';
                    break;
                case 'completed':
                    message = 'Нет завершенных задач';
                    icon = 'bi-emoji-frown';
                    break;
                default:
                    message = 'Нет задач';
                    icon = 'bi-emoji-smile';
            }

            elements.taskList.innerHTML = `
            <div class="empty-state fade-in">
                <i class="bi ${icon}"></i>
                <h4>${message}</h4>
                <p>${state.filter === 'all' ? 'Добавьте свою первую задачу' : ''}</p>
            </div>
        `;
        }

        function showAlert(message, type) {
            const alert = document.createElement('div');
            alert.className = `alert alert-${type} alert-dismissible fade show mt-3`;
            alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

            elements.taskList.prepend(alert);

            setTimeout(() => {
                alert.classList.remove('show');
                setTimeout(() => alert.remove(), 150);
            }, 3000);
        }

        function showError(message) {
            showAlert(message, 'danger');
        }

        function escapeHtml(text) {
            return text?.toString()
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;") || '';
        }

        function formatDate(dateString) {
            if (!dateString) return 'не указана';
            try {
                const date = new Date(dateString);
                return isNaN(date.getTime())
                    ? 'некорректная дата'
                    : date.toLocaleString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
            } catch {
                return 'некорректная дата';
            }
        }

        function formatDateForInput(dateString) {
            if (!dateString) return '';
            try {
                const date = new Date(dateString);
                return isNaN(date.getTime())
                    ? ''
                    : date.toISOString().slice(0, 16);
            } catch {
                return '';
            }
        }
    });    