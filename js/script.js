function updateDashboard() {
    let now = new Date();
    let hours = String(now.getHours()).padStart(2, '0');
    let minutes = String(now.getMinutes()).padStart(2, '0');
    let seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('clock').innerHTML = `${hours}:${minutes}:${seconds}`;
    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('date').innerHTML = now.toLocaleDateString('en-US', options);
    let greeting = "";
    let h = now.getHours();
    if (h >= 5 && h < 12) greeting = "Good morning";
    else if (h >= 12 && h < 18) greeting = "Good afternoon";
    else greeting = "Good evening";
    document.getElementById('greeting').innerHTML = greeting + "!";
}
setInterval(updateDashboard, 1000);
updateDashboard();

let timer;
let timeLeft = 25 * 60; 
let isRunning = false;

function updateTimerDisplay() {
    let minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    let seconds = String(timeLeft % 60).padStart(2, '0');
    document.getElementById('timer-display').innerHTML = `${minutes}:${seconds}`;
}
function startTimer() {
    if (isRunning) return;
    isRunning = true;
    timer = setInterval(() => {
        if (timeLeft > 0) { timeLeft--; updateTimerDisplay(); } 
        else { clearInterval(timer); isRunning = false; alert("Focus time is over!"); resetTimer(); }
    }, 1000);
}
function stopTimer() { clearInterval(timer); isRunning = false; }
function resetTimer() { clearInterval(timer); isRunning = false; timeLeft = 25 * 60; updateTimerDisplay(); }

let tasks = JSON.parse(localStorage.getItem('productivity_tasks')) || [];
function renderTasks() {
    const taskListElement = document.getElementById('task-list');
    taskListElement.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
            <div class="task-left">
                <input type="checkbox" ${task.completed ? 'checked' : ''} onclick="toggleTask(${index})">
                <span class="task-text ${task.completed ? 'completed' : ''}" id="task-text-${index}">${task.text}</span>
            </div>
            <button class="btn-danger" onclick="deleteTask(${index})">Delete</button>
        `;
        taskListElement.appendChild(li);
    });
    localStorage.setItem('productivity_tasks', JSON.stringify(tasks));
}
function addTask() {
    const input = document.getElementById('task-input');
    if (input.value.trim() === '') return;
    tasks.push({ text: input.value.trim(), completed: false });
    input.value = '';
    renderTasks();
}
function handleTaskKeyPress(event) { if (event.key === 'Enter') addTask(); }
function toggleTask(index) { tasks[index].completed = !tasks[index].completed; renderTasks(); }
function deleteTask(index) { tasks.splice(index, 1); renderTasks(); }
renderTasks();

let quickLinks = JSON.parse(localStorage.getItem('productivity_links')) || [
    { name: 'Google', url: 'https://google.com' },
    { name: 'Gmail', url: 'https://mail.google.com' }
];
function renderLinks() {
    const container = document.getElementById('links-container');
    container.innerHTML = '';
    quickLinks.forEach((link, index) => {
        const linkButton = document.createElement('div');
        linkButton.className = 'link-btn';
        linkButton.setAttribute('onclick', `window.open('${link.url}', '_blank')`);
        linkButton.innerHTML = `${link.name} <span class="link-delete-icon" onclick="deleteLink(event, ${index})">×</span>`;
        container.appendChild(linkButton);
    });
    localStorage.setItem('productivity_links', JSON.stringify(quickLinks));
}
function addLink() {
    const nameInput = document.getElementById('link-name-input');
    const urlInput = document.getElementById('link-url-input');
    let name = nameInput.value.trim(); let url = urlInput.value.trim();
    if (name === '' || url === '') return;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    quickLinks.push({ name: name, url: url });
    nameInput.value = ''; urlInput.value = '';
    renderLinks();
}
function deleteLink(event, index) { event.stopPropagation(); quickLinks.splice(index, 1); renderLinks(); }
renderLinks();