// State management
const state = {
    habits: [],
    currentView: 'habits',
    user: {
        name: 'User',
        level: 1,
        experience: 0,
        coins: 0
    }
};

// Load data from localStorage
function loadData() {
    const savedHabits = localStorage.getItem('habits');
    const savedUser = localStorage.getItem('user');
    
    if (savedHabits) {
        state.habits = JSON.parse(savedHabits);
    }
    if (savedUser) {
        state.user = JSON.parse(savedUser);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('habits', JSON.stringify(state.habits));
    localStorage.setItem('user', JSON.stringify(state.user));
}

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        const view = item.dataset.view;
        if (view) {
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            renderView(view);
        }
    });
});

// Add new habit
document.querySelector('.add-habit').addEventListener('click', () => {
    showAddHabitModal();
});

function showAddHabitModal() {
    const modal = document.createElement('div');
    modal.className = 'modal slide-up';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Add New Habit</h2>
            <form id="add-habit-form">
                <input type="text" placeholder="Habit Name" required>
                <select required>
                    <option value="">Select Category</option>
                    <option value="health">Health & Fitness</option>
                    <option value="mindfulness">Mindfulness</option>
                    <option value="productivity">Productivity</option>
                </select>
                <button type="submit">Add Habit</button>
                <button type="button" class="cancel">Cancel</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.cancel').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = e.target.querySelector('input').value;
        const category = e.target.querySelector('select').value;
        
        addHabit(name, category);
        modal.remove();
        renderView('habits');
    });
}

function addHabit(name, category) {
    const habit = {
        id: Date.now(),
        name,
        category,
        streak: 0,
        lastCompleted: null
    };
    
    state.habits.push(habit);
    saveData();
}

function completeHabit(habitId) {
    const habit = state.habits.find(h => h.id === habitId);
    if (habit) {
        const now = new Date();
        habit.lastCompleted = now.toISOString();
        habit.streak++;
        
        // Add experience and coins
        state.user.experience += 10;
        state.user.coins += 5;
        
        // Check for level up
        if (state.user.experience >= state.user.level * 100) {
            state.user.level++;
            showLevelUpNotification();
        }
        
        saveData();
        renderView('habits');
    }
}

function showLevelUpNotification() {
    const notification = document.createElement('div');
    notification.className = 'notification slide-up';
    notification.innerHTML = `
        <div class="notification-content">
            <h3>Level Up!</h3>
            <p>Congratulations! You've reached level ${state.user.level}</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function renderView(view) {
    const appContainer = document.querySelector('#app');
    state.currentView = view;
    
    let content = '';
    switch (view) {
        case 'habits':
            content = renderHabitsView();
            break;
        case 'community':
            content = renderCommunityView();
            break;
        case 'stats':
            content = renderStatsView();
            break;
        case 'profile':
            content = renderProfileView();
            break;
    }
    
    appContainer.innerHTML = content;
    
    // Add event listeners after rendering
    if (view === 'habits') {
        document.querySelectorAll('.complete-button').forEach(button => {
            button.addEventListener('click', () => {
                completeHabit(parseInt(button.dataset.habitId));
            });
        });
    }
}

function renderHabitsView() {
    const today = new Date();
    return `
        <div class="habits-container">
            <h1>Today's Habits</h1>
            ${state.habits.map(habit => `
                <div class="habit-card">
                    <div class="habit-header">
                        <div class="habit-icon">
                            <i class="fas fa-${getHabitIcon(habit.category)}"></i>
                        </div>
                        <div class="habit-info">
                            <div class="habit-name">${habit.name}</div>
                            <div class="habit-streak">${habit.streak} day streak</div>
                        </div>
                        <button 
                            class="complete-button" 
                            data-habit-id="${habit.id}"
                            ${isHabitCompletedToday(habit) ? 'disabled' : ''}
                        >
                            ${isHabitCompletedToday(habit) ? 'Completed' : 'Complete'}
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function getHabitIcon(category) {
    switch (category) {
        case 'health':
            return 'heart';
        case 'mindfulness':
            return 'brain';
        case 'productivity':
            return 'tasks';
        default:
            return 'check';
    }
}

function isHabitCompletedToday(habit) {
    if (!habit.lastCompleted) return false;
    const lastCompleted = new Date(habit.lastCompleted);
    const today = new Date();
    return lastCompleted.toDateString() === today.toDateString();
}

// Initialize app
loadData();
renderView('habits'); 