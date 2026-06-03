// frontend komunikuje się z backendem przez względną ścieżkę /api
// (Ingress routuje /api do backend-service) - nie znamy bezpośredniego adresu backendu
const API = '/api';

const PRIORITY_LABELS = { low: 'niski', medium: 'średni', high: 'wysoki' };

// pobiera listę zadań z backendu i renderuje ją na stronie
async function loadTasks() {
  const res = await fetch(`${API}/tasks`);
  const tasks = await res.json();

  const list = document.getElementById('task-list');
  list.innerHTML = '';

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item';

    // priorytet może nie istnieć w starej wersji backendu (v1) - zabezpieczenie
    const priority = task.priority || 'medium';

    li.innerHTML = `
      <span class="task-title">${task.title}</span>
      <span class="task-desc">${task.description || ''}</span>
      <span class="badge badge-${priority}">${PRIORITY_LABELS[priority]}</span>
    `;
    list.appendChild(li);
  });
}

// wysyła nowe zadanie do backendu przez POST /api/tasks
async function addTask(event) {
  event.preventDefault();

  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const priority = document.getElementById('priority').value;

  await fetch(`${API}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, priority }),
  });

  event.target.reset();
  loadTasks();
}

// podpięcie obsługi formularza i ładowanie zadan przy starcie
document.getElementById('task-form').addEventListener('submit', addTask);
loadTasks();
