// Task Manager Application
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    
    // Task Manager Elements
    const taskForm = document.getElementById('taskForm');
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const taskDueDateInput = document.getElementById('taskDueDate');
    const tasksContainer = document.getElementById('tasksContainer');
    const taskCount = document.getElementById('taskCount');
    const totalTimeElement = document.getElementById('totalTimeTracked');
    const completedTasksElement = document.getElementById('completedTasksCount');
    const activeTaskContainer = document.getElementById('activeTaskContainer');
    const activeTaskTitle = document.getElementById('activeTaskTitle');
    const activeTaskTimer = document.getElementById('activeTaskTimer');
    const pauseTimerBtn = document.getElementById('pauseTimer');
    const stopTimerBtn = document.getElementById('stopTimer');

    // Dashboard Elements
    const totalTasksElement = document.getElementById('totalTasks');
    const dashboardTotalTime = document.getElementById('totalTime');
    const dashboardCompletedTasks = document.getElementById('completedTasks');
    const productivityScore = document.getElementById('productivityScore');
    const recentTasksList = document.getElementById('recentTasksList');

    // Calendar Elements
    const calendarGrid = document.getElementById('calendarGrid');
    const calendarMonthYear = document.getElementById('calendarMonthYear');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const todayBtn = document.getElementById('todayBtn');
    const viewOptions = document.querySelectorAll('.view-option');
    const taskDetailModal = document.getElementById('taskDetailModal');
    const closeTaskModal = document.getElementById('closeTaskModal');
    const taskDetailContent = document.getElementById('taskDetailContent');

    // Reports Elements
    const reportTasks = document.getElementById('reportTasks');
    const reportTime = document.getElementById('reportTime');
    const reportCompleted = document.getElementById('reportCompleted');
    const reportProductivity = document.getElementById('reportProductivity');

    // Profile Elements
    const profileName = document.getElementById('profileName');
    const profileRole = document.getElementById('profileRole');
    const profileTasks = document.getElementById('profileTasks');
    const profileTime = document.getElementById('profileTime');
    const profileForm = document.getElementById('profileForm');
    const passwordForm = document.getElementById('passwordForm');

    // Application State
    let tasks = [];
    let activeTaskId = null;
    let timerInterval = null;
    let elapsedTime = 0;
    let isTimerRunning = false;

    // Calendar State
    let currentDate = new Date();
    let currentView = 'month';

    // Initialize the application
    function init() {
        loadTasksFromStorage();
        setupNavigation();
        setupEventListeners();
        updateAllDisplays();
        renderCalendar();
    }

    // Set up navigation between pages
    function setupNavigation() {
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const pageId = this.getAttribute('data-page');
                
                // Update active nav link
                navLinks.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                
                // Show the selected page
                pages.forEach(page => page.classList.remove('active'));
                document.getElementById(pageId).classList.add('active');
                
                // Close mobile menu if open
                mobileNav.classList.remove('active');
                
                // If calendar page, refresh calendar
                if (pageId === 'calendar') {
                    renderCalendar();
                }
            });
        });

        // Mobile menu toggle
        mobileMenuBtn.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
        });
    }

    // Set up event listeners
    function setupEventListeners() {
        if (taskForm) {
            taskForm.addEventListener('submit', handleAddTask);
        }
        if (pauseTimerBtn) {
            pauseTimerBtn.addEventListener('click', toggleTimer);
        }
        if (stopTimerBtn) {
            stopTimerBtn.addEventListener('click', stopTimer);
        }
        if (profileForm) {
            profileForm.addEventListener('submit', handleProfileUpdate);
        }
        if (passwordForm) {
            passwordForm.addEventListener('submit', handlePasswordChange);
        }
        
        // Calendar event listeners
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', goToPreviousMonth);
        }
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', goToNextMonth);
        }
        if (todayBtn) {
            todayBtn.addEventListener('click', goToToday);
        }
        if (closeTaskModal) {
            closeTaskModal.addEventListener('click', closeModal);
        }
        
        // View options
        viewOptions.forEach(option => {
            option.addEventListener('click', function() {
                viewOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                currentView = this.getAttribute('data-view');
                renderCalendar();
            });
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === taskDetailModal) {
                closeModal();
            }
        });
    }

    // Handle adding a new task
    function handleAddTask(e) {
        e.preventDefault();
        
        const title = taskTitleInput.value.trim();
        const description = taskDescriptionInput.value.trim();
        const category = document.getElementById('taskCategory').value;
        const priority = document.getElementById('taskPriority').value;
        const dueDate = taskDueDateInput.value;
        
        if (!title) {
            alert('Please enter a task title');
            return;
        }
        
        const newTask = {
            id: Date.now().toString(),
            title,
            description,
            category,
            priority,
            timeSpent: 0, // in seconds
            isCompleted: false,
            createdAt: new Date().toISOString(),
            dueDate: dueDate || null
        };
        
        tasks.push(newTask);
        saveTasksToStorage();
        updateAllDisplays();
        
        // Reset form
        taskForm.reset();
    }

    // Update all displays across pages
    function updateAllDisplays() {
        renderTasks();
        updateDashboard();
        updateReports();
        updateProfile();
        
        // Update calendar if it's visible
        if (document.getElementById('calendar').classList.contains('active')) {
            renderCalendar();
        }
    }

    // Render all tasks on the task manager page
    function renderTasks() {
        if (!tasksContainer) return;
        
        if (tasks.length === 0) {
            tasksContainer.innerHTML = `
                <div class="empty-state">
                    <i>📝</i>
                    <h3>No tasks yet</h3>
                    <p>Add your first task to get started!</p>
                </div>
            `;
            if (taskCount) taskCount.textContent = '0 tasks';
            return;
        }
        
        tasksContainer.innerHTML = '';
        if (taskCount) taskCount.textContent = `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`;
        
        // Sort tasks by creation date (newest first)
        const sortedTasks = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        sortedTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            tasksContainer.appendChild(taskElement);
        });
        
        updateTaskStats();
    }

    // Create a task element
    function createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.id === activeTaskId ? 'active' : ''}`;
        
        const timeFormatted = formatTime(task.timeSpent);
        const priorityClass = `priority-${task.priority}`;
        const dueDateFormatted = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
        
        taskElement.innerHTML = `
            <div class="task-header">
                <div class="task-title">${task.title} <span class="task-category">${getCategoryIcon(task.category)}</span></div>
                <div class="task-actions">
                    <button class="btn btn-sm ${task.id === activeTaskId ? 'btn-warning' : 'btn-success'}" data-action="timer" data-id="${task.id}">
                        ${task.id === activeTaskId ? '⏸️' : '▶️'}
                    </button>
                    <button class="btn btn-sm btn-secondary" data-action="edit" data-id="${task.id}">✏️</button>
                    <button class="btn btn-sm btn-danger" data-action="delete" data-id="${task.id}">🗑️</button>
                </div>
            </div>
            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            <div class="task-timer">
                <div class="timer-display">${timeFormatted}</div>
                <div>Due: ${dueDateFormatted}</div>
            </div>
            <div class="task-actions">
                <button class="btn btn-sm ${task.isCompleted ? 'btn-secondary' : 'btn-success'}" data-action="complete" data-id="${task.id}">
                    ${task.isCompleted ? '✓ Completed' : 'Mark Complete'}
                </button>
            </div>
        `;
        
        // Add event listeners to action buttons
        const actionButtons = taskElement.querySelectorAll('button[data-action]');
        actionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                const taskId = this.getAttribute('data-id');
                handleTaskAction(action, taskId);
            });
        });
        
        return taskElement;
    }

    // Get category icon
    function getCategoryIcon(category) {
        const icons = {
            'work': '💼',
            'personal': '🏠',
            'health': '💪',
            'learning': '📚',
            'other': '📌'
        };
        return icons[category] || '📌';
    }

    // Handle task actions (timer, edit, delete, complete)
    function handleTaskAction(action, taskId) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return;
        
        switch(action) {
            case 'timer':
                if (taskId === activeTaskId) {
                    toggleTimer();
                } else {
                    startTimer(taskId);
                }
                break;
            case 'edit':
                editTask(taskId);
                break;
            case 'delete':
                deleteTask(taskId);
                break;
            case 'complete':
                toggleCompleteTask(taskId);
                break;
        }
    }

    // Start timer for a task
    function startTimer(taskId) {
        // Stop any running timer first
        if (activeTaskId) {
            stopTimer();
        }
        
        activeTaskId = taskId;
        elapsedTime = 0;
        isTimerRunning = true;
        
        // Update UI
        if (activeTaskContainer) activeTaskContainer.style.display = 'block';
        if (activeTaskTitle) activeTaskTitle.textContent = tasks.find(task => task.id === taskId).title;
        if (activeTaskTimer) activeTaskTimer.textContent = '00:00:00';
        if (pauseTimerBtn) pauseTimerBtn.textContent = 'Pause';
        
        // Start the interval
        timerInterval = setInterval(updateTimer, 1000);
        
        // Re-render tasks to update active state
        renderTasks();
    }

    // Update the timer display
    function updateTimer() {
        if (isTimerRunning) {
            elapsedTime++;
            if (activeTaskTimer) activeTaskTimer.textContent = formatTime(elapsedTime);
        }
    }

    // Toggle timer between running and paused
    function toggleTimer() {
        isTimerRunning = !isTimerRunning;
        if (pauseTimerBtn) pauseTimerBtn.textContent = isTimerRunning ? 'Pause' : 'Resume';
    }

    // Stop the timer and save the time to the task
    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        if (activeTaskId && elapsedTime > 0) {
            const taskIndex = tasks.findIndex(task => task.id === activeTaskId);
            if (taskIndex !== -1) {
                tasks[taskIndex].timeSpent += elapsedTime;
                saveTasksToStorage();
                updateAllDisplays();
            }
        }
        
        // Reset timer state
        activeTaskId = null;
        elapsedTime = 0;
        isTimerRunning = false;
        
        // Update UI
        if (activeTaskContainer) activeTaskContainer.style.display = 'none';
        renderTasks();
    }

    // Edit a task
    function editTask(taskId) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return;
        
        const task = tasks[taskIndex];
        
        const newTitle = prompt('Edit task title:', task.title);
        if (newTitle === null) return; // User canceled
        
        const newDescription = prompt('Edit task description:', task.description);
        const newDueDate = prompt('Edit due date (YYYY-MM-DD):', task.dueDate || '');
        
        tasks[taskIndex].title = newTitle.trim();
        tasks[taskIndex].description = newDescription ? newDescription.trim() : '';
        tasks[taskIndex].dueDate = newDueDate ? newDueDate.trim() : null;
        
        saveTasksToStorage();
        updateAllDisplays();
    }

    // Delete a task
    function deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;
        
        // If the task being deleted is the active task, stop the timer first
        if (taskId === activeTaskId) {
            stopTimer();
        }
        
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasksToStorage();
        updateAllDisplays();
    }

    // Toggle task completion status
    function toggleCompleteTask(taskId) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return;
        
        tasks[taskIndex].isCompleted = !tasks[taskIndex].isCompleted;
        saveTasksToStorage();
        updateAllDisplays();
    }

    // Update task statistics
    function updateTaskStats() {
        if (!totalTimeElement || !completedTasksElement) return;
        
        // Calculate total time
        const totalSeconds = tasks.reduce((total, task) => total + task.timeSpent, 0);
        totalTimeElement.textContent = formatTime(totalSeconds, true);
        
        // Count completed tasks
        const completedCount = tasks.filter(task => task.isCompleted).length;
        completedTasksElement.textContent = `${completedCount} completed`;
    }

    // Update dashboard
    function updateDashboard() {
        if (!totalTasksElement) return;
        
        // Update stats
        totalTasksElement.textContent = tasks.length;
        
        const totalSeconds = tasks.reduce((total, task) => total + task.timeSpent, 0);
        dashboardTotalTime.textContent = formatTime(totalSeconds, true);
        
        const completedCount = tasks.filter(task => task.isCompleted).length;
        dashboardCompletedTasks.textContent = completedCount;
        
        // Calculate productivity score
        const productivity = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
        productivityScore.textContent = `${productivity}%`;
        
        // Update recent tasks
        updateRecentTasks();
    }

    // Update recent tasks on dashboard
    function updateRecentTasks() {
        if (!recentTasksList) return;
        
        const recentTasks = tasks.slice(-5).reverse();
        
        if (recentTasks.length === 0) {
            recentTasksList.innerHTML = `
                <div class="empty-state">
                    <i>📝</i>
                    <h3>No tasks yet</h3>
                    <p>Get started by creating your first task!</p>
                </div>
            `;
            return;
        }
        
        recentTasksList.innerHTML = '';
        recentTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item';
            
            const timeFormatted = formatTime(task.timeSpent);
            const dueDateFormatted = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
            
            taskElement.innerHTML = `
                <div class="task-header">
                    <div class="task-title">${task.title}</div>
                    <span class="task-category">${getCategoryIcon(task.category)}</span>
                </div>
                <div class="task-timer">
                    <div class="timer-display">${timeFormatted}</div>
                    <div>Due: ${dueDateFormatted}</div>
                </div>
                <div class="task-status">
                    ${task.isCompleted ? '✅ Completed' : '⏳ In Progress'}
                </div>
            `;
            
            recentTasksList.appendChild(taskElement);
        });
    }

    // Update reports page
    function updateReports() {
        if (!reportTasks) return;
        
        // For demo purposes, we'll use the same data as dashboard
        // In a real app, you would filter by date range
        reportTasks.textContent = tasks.length;
        
        const totalSeconds = tasks.reduce((total, task) => total + task.timeSpent, 0);
        reportTime.textContent = formatTime(totalSeconds, true);
        
        const completedCount = tasks.filter(task => task.isCompleted).length;
        reportCompleted.textContent = completedCount;
        
        const productivity = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
        reportProductivity.textContent = `${productivity}%`;
    }

    // Update profile page
    function updateProfile() {
        if (!profileName || !profileTasks || !profileTime) return;
        
        // Update profile stats
        profileTasks.textContent = tasks.length;
        
        const totalSeconds = tasks.reduce((total, task) => total + task.timeSpent, 0);
        profileTime.textContent = formatTime(totalSeconds, true);
        
        // Update profile name if form exists
        if (document.getElementById('profileFirstName') && document.getElementById('profileLastName')) {
            const firstName = document.getElementById('profileFirstName').value;
            const lastName = document.getElementById('profileLastName').value;
            profileName.textContent = `${firstName} ${lastName}`;
        }
    }

    // Handle profile update
    function handleProfileUpdate(e) {
        e.preventDefault();
        alert('Profile updated successfully!');
        updateProfile();
    }

    // Handle password change
    function handlePasswordChange(e) {
        e.preventDefault();
        alert('Password changed successfully!');
        document.getElementById('passwordForm').reset();
    }

    // Calendar Functions
    function renderCalendar() {
        if (!calendarGrid) return;
        
        // Clear the calendar
        calendarGrid.innerHTML = '';
        
        // Add day headers
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });
        
        // Get the first day of the current month and the number of days
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        // Update the calendar header
        if (calendarMonthYear) {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            calendarMonthYear.textContent = `${monthNames[month]} ${year}`;
        }
        
        // Add days from previous month
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            const dayElement = createDayElement(prevMonthLastDay - i, true);
            calendarGrid.appendChild(dayElement);
        }
        
        // Add days from current month
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = date.toDateString() === today.toDateString();
            const dayElement = createDayElement(day, false, isToday);
            calendarGrid.appendChild(dayElement);
        }
        
        // Add days from next month to complete the grid
        const totalCells = 42; // 6 rows x 7 days
        const remainingCells = totalCells - (startingDay + daysInMonth);
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = createDayElement(day, true);
            calendarGrid.appendChild(dayElement);
        }
    }

    function createDayElement(day, isOtherMonth, isToday = false) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        
        if (isToday) {
            dayElement.classList.add('today');
        }
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);
        
        // Add tasks for this day
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        const dayTasks = tasks.filter(task => {
            if (!task.dueDate) return false;
            const taskDate = task.dueDate.split('T')[0];
            return taskDate === dateStr;
        });
        
        // Show up to 3 tasks, with a "+ more" indicator if there are more
        const maxTasksToShow = 3;
        dayTasks.slice(0, maxTasksToShow).forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `calendar-task ${task.category}`;
            taskElement.textContent = task.title;
            taskElement.title = task.title;
            taskElement.addEventListener('click', (e) => {
                e.stopPropagation();
                showTaskDetails(task);
            });
            dayElement.appendChild(taskElement);
        });
        
        if (dayTasks.length > maxTasksToShow) {
            const moreElement = document.createElement('div');
            moreElement.className = 'calendar-task other';
            moreElement.textContent = `+${dayTasks.length - maxTasksToShow} more`;
            moreElement.title = `${dayTasks.length - maxTasksToShow} more tasks`;
            moreElement.addEventListener('click', (e) => {
                e.stopPropagation();
                showDayTasks(dayTasks, dateStr);
            });
            dayElement.appendChild(moreElement);
        }
        
        // Add click event to the day element
        if (!isOtherMonth) {
            dayElement.addEventListener('click', () => {
                // Remove selected class from all days
                document.querySelectorAll('.calendar-day').forEach(day => {
                    day.classList.remove('selected');
                });
                
                // Add selected class to clicked day
                dayElement.classList.add('selected');
                
                // Show tasks for this day in a modal or side panel
                showDayTasks(dayTasks, dateStr);
            });
        }
        
        return dayElement;
    }

    function showTaskDetails(task) {
        if (!taskDetailContent || !taskDetailModal) return;
        
        const dueDateFormatted = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
        const timeFormatted = formatTime(task.timeSpent);
        const createdAtFormatted = new Date(task.createdAt).toLocaleDateString();
        
        taskDetailContent.innerHTML = `
            <h3>${task.title}</h3>
            <p><strong>Description:</strong> ${task.description || 'No description'}</p>
            <p><strong>Category:</strong> ${task.category} ${getCategoryIcon(task.category)}</p>
            <p><strong>Priority:</strong> ${task.priority}</p>
            <p><strong>Due Date:</strong> ${dueDateFormatted}</p>
            <p><strong>Time Spent:</strong> ${timeFormatted}</p>
            <p><strong>Created:</strong> ${createdAtFormatted}</p>
            <p><strong>Status:</strong> ${task.isCompleted ? 'Completed' : 'In Progress'}</p>
            <div class="task-actions" style="margin-top: 15px;">
                <button class="btn btn-sm ${task.isCompleted ? 'btn-secondary' : 'btn-success'}" id="modalCompleteBtn">
                    ${task.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
                <button class="btn btn-sm btn-secondary" id="modalEditBtn">Edit</button>
                <button class="btn btn-sm btn-danger" id="modalDeleteBtn">Delete</button>
            </div>
        `;
        
        // Add event listeners to modal buttons
        document.getElementById('modalCompleteBtn').addEventListener('click', () => {
            toggleCompleteTask(task.id);
            closeModal();
            updateAllDisplays();
        });
        
        document.getElementById('modalEditBtn').addEventListener('click', () => {
            closeModal();
            editTask(task.id);
        });
        
        document.getElementById('modalDeleteBtn').addEventListener('click', () => {
            closeModal();
            deleteTask(task.id);
        });
        
        taskDetailModal.classList.add('active');
    }

    function showDayTasks(dayTasks, dateStr) {
        if (!taskDetailContent || !taskDetailModal) return;
        
        const dateFormatted = new Date(dateStr).toLocaleDateString();
        
        if (dayTasks.length === 0) {
            taskDetailContent.innerHTML = `
                <h3>Tasks for ${dateFormatted}</h3>
                <p>No tasks scheduled for this day.</p>
                <button class="btn btn-primary" id="addTaskToDate">Add Task</button>
            `;
            
            document.getElementById('addTaskToDate').addEventListener('click', () => {
                closeModal();
                // Navigate to task manager and pre-fill the due date
                navLinks.forEach(nav => nav.classList.remove('active'));
                document.querySelector('[data-page="tasks"]').classList.add('active');
                pages.forEach(page => page.classList.remove('active'));
                document.getElementById('tasks').classList.add('active');
                
                // Set the due date in the task form
                taskDueDateInput.value = dateStr;
            });
        } else {
            taskDetailContent.innerHTML = `
                <h3>Tasks for ${dateFormatted}</h3>
                <div id="dayTasksList">
                    ${dayTasks.map(task => `
                        <div class="task-item" style="margin-bottom: 10px;">
                            <div class="task-header">
                                <div class="task-title">${task.title}</div>
                                <span class="task-category">${getCategoryIcon(task.category)}</span>
                            </div>
                            <div class="task-status">
                                ${task.isCompleted ? '✅ Completed' : '⏳ In Progress'}
                            </div>
                            <div class="task-actions">
                                <button class="btn btn-sm btn-primary view-task" data-id="${task.id}">View</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button class="btn btn-primary" style="margin-top: 15px;" id="addTaskToDate">Add Task</button>
            `;
            
            // Add event listeners to view buttons
            document.querySelectorAll('.view-task').forEach(button => {
                button.addEventListener('click', () => {
                    const taskId = button.getAttribute('data-id');
                    const task = tasks.find(t => t.id === taskId);
                    if (task) {
                        showTaskDetails(task);
                    }
                });
            });
            
            document.getElementById('addTaskToDate').addEventListener('click', () => {
                closeModal();
                // Navigate to task manager and pre-fill the due date
                navLinks.forEach(nav => nav.classList.remove('active'));
                document.querySelector('[data-page="tasks"]').classList.add('active');
                pages.forEach(page => page.classList.remove('active'));
                document.getElementById('tasks').classList.add('active');
                
                // Set the due date in the task form
                taskDueDateInput.value = dateStr;
            });
        }
        
        taskDetailModal.classList.add('active');
    }

    function closeModal() {
        taskDetailModal.classList.remove('active');
    }

    function goToPreviousMonth() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    }

    function goToNextMonth() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    }

    function goToToday() {
        currentDate = new Date();
        renderCalendar();
    }

    // Format time in seconds to HH:MM:SS or human-readable format
    function formatTime(seconds, humanReadable = false) {
        if (humanReadable) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            
            if (hours > 0) {
                return `${hours}h ${minutes}m`;
            } else {
                return `${minutes}m`;
            }
        }
        
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return [
            hrs.toString().padStart(2, '0'),
            mins.toString().padStart(2, '0'),
            secs.toString().padStart(2, '0')
        ].join(':');
    }

    // Save tasks to localStorage
    function saveTasksToStorage() {
        localStorage.setItem('taskManagerTasks', JSON.stringify(tasks));
    }

    // Load tasks from localStorage
    function loadTasksFromStorage() {
        const storedTasks = localStorage.getItem('taskManagerTasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        }
    }

    // Initialize the application
    init();
});