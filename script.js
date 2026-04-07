// ====================== VARIÁVEIS GLOBAIS ======================
let users = [];
let projects = [];
let tasks = [];

const STORAGE_KEYS = {
    users: 'proManage_users',
    projects: 'proManage_projects',
    tasks: 'proManage_tasks'
};

// ====================== INICIALIZAÇÃO ======================
window.onload = function () {
    const isLogged = localStorage.getItem('proManage_logged');
    if (!isLogged) {
        window.location.href = 'login.html';
        return;
    }

    const userData = JSON.parse(localStorage.getItem('proManage_user') || '{}');
    const el = document.getElementById('navUserName');
    if (el && userData.nome) el.textContent = userData.nome.split(' ')[0];

    initData();
    loadSection('dashboard');
};

function initData() {
    users    = JSON.parse(localStorage.getItem(STORAGE_KEYS.users)    || '[]');
    projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.projects) || '[]');
    tasks    = JSON.parse(localStorage.getItem(STORAGE_KEYS.tasks)    || '[]');
}

function saveData() {
    localStorage.setItem(STORAGE_KEYS.users,    JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
    localStorage.setItem(STORAGE_KEYS.tasks,    JSON.stringify(tasks));
}

// ====================== NAVEGAÇÃO ======================
function loadSection(section) {
    const content = document.getElementById('content');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const active = document.getElementById('nav-' + section);
    if (active) active.classList.add('active');

    if (section === 'dashboard') renderDashboard(content);
    else if (section === 'users')    renderUsers(content);
    else if (section === 'projects') renderProjects(content);
    else if (section === 'tasks')    renderTasks(content);
}

// ====================== DASHBOARD ======================
function renderDashboard(content) {
    const total      = tasks.length;
    const concluidas = tasks.filter(t => t.status === 'concluida').length;
    const emAndamento = tasks.filter(t => t.status === 'em_andamento').length;
    const pendentes  = total - concluidas - emAndamento;

    content.innerHTML = `
        <h2 class="mb-4">Painel de controle</h2>
        <div class="row g-4">
            <div class="col-6 col-md-3">
                <div class="card text-center">
                    <div class="card-body">
                        <h1 class="text-primary">${projects.length}</h1>
                        <p class="text-muted mb-0">Projetos</p>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="card text-center">
                    <div class="card-body">
                        <h1 class="text-success">${concluidas}</h1>
                        <p class="text-muted mb-0">Concluídas</p>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="card text-center">
                    <div class="card-body">
                        <h1 class="text-warning">${emAndamento}</h1>
                        <p class="text-muted mb-0">Em Andamento</p>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="card text-center">
                    <div class="card-body">
                        <h1 class="text-danger">${pendentes}</h1>
                        <p class="text-muted mb-0">Pendentes</p>
                    </div>
                </div>
            </div>
        </div>`;
}

// ====================== USUÁRIOS ======================
function renderUsers(content) {
    content.innerHTML = `
        <h2 class="mb-4">Usuários</h2>
        <button class="btn btn-primary mb-3" onclick="showUserModal()">+ Novo Usuário</button>
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>E-mail</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="usersTableBody"></tbody>
            </table>
        </div>`;

    const tbody = document.getElementById('usersTableBody');

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Nenhum usuário cadastrado</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.nome}</td>
            <td>${user.email}</td>
            <td>
                <button class="btn btn-sm btn-warning me-2" onclick="editUser(${user.id})">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">Excluir</button>
            </td>
        </tr>`).join('');
}

function showUserModal() {
    document.getElementById('userModalTitle').textContent = 'Novo Usuário';
    document.getElementById('userId').value  = '';
    document.getElementById('userNome').value  = '';
    document.getElementById('userEmail').value = '';
    new bootstrap.Modal(document.getElementById('userModal')).show();
}

function editUser(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;

    document.getElementById('userModalTitle').textContent = 'Editar Usuário';
    document.getElementById('userId').value  = user.id;
    document.getElementById('userNome').value  = user.nome;
    document.getElementById('userEmail').value = user.email;
    new bootstrap.Modal(document.getElementById('userModal')).show();
}

function saveUser() {
    const id    = document.getElementById('userId').value;
    const nome  = document.getElementById('userNome').value.trim();
    const email = document.getElementById('userEmail').value.trim();

    if (!nome || !email) { alert('Preencha nome e e-mail!'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('E-mail inválido!'); return; }

    if (id) {
        const user = users.find(u => u.id == id);
        user.nome  = nome;
        user.email = email;
    } else {
        const newId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
        users.push({ id: newId, nome, email });
    }

    saveData();
    bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
    loadSection('users');
}

function deleteUser(id) {
    const hasTasks = tasks.some(t => t.userId === id);
    if (hasTasks) {
        alert('Não é possível excluir um usuário com tarefas atribuídas. Reatribua as tarefas primeiro.');
        return;
    }
    if (!confirm('Excluir este usuário?')) return;

    users = users.filter(u => u.id !== id);
    saveData();
    loadSection('users');
}

// ====================== PROJETOS ======================
function renderProjects(content) {
    content.innerHTML = `
        <h2 class="mb-4">Projetos</h2>
        <button class="btn btn-primary mb-3" onclick="showProjectModal()">+ Novo Projeto</button>
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Descrição</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="projectsTableBody"></tbody>
            </table>
        </div>`;

    const tbody = document.getElementById('projectsTableBody');

    if (projects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Nenhum projeto cadastrado</td></tr>';
        return;
    }

    tbody.innerHTML = projects.map(proj => `
        <tr>
            <td>${proj.nome}</td>
            <td>${proj.descricao || '—'}</td>
            <td>
                <button class="btn btn-sm btn-warning me-2" onclick="editProject(${proj.id})">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProject(${proj.id})">Excluir</button>
            </td>
        </tr>`).join('');
}

function showProjectModal() {
    document.getElementById('projectModalTitle').textContent = 'Novo Projeto';
    document.getElementById('projectId').value       = '';
    document.getElementById('projectNome').value     = '';
    document.getElementById('projectDescricao').value = '';
    new bootstrap.Modal(document.getElementById('projectModal')).show();
}

function editProject(id) {
    const proj = projects.find(p => p.id === id);
    if (!proj) return;

    document.getElementById('projectModalTitle').textContent = 'Editar Projeto';
    document.getElementById('projectId').value       = proj.id;
    document.getElementById('projectNome').value     = proj.nome;
    document.getElementById('projectDescricao').value = proj.descricao || '';
    new bootstrap.Modal(document.getElementById('projectModal')).show();
}

function saveProject() {
    const id       = document.getElementById('projectId').value;
    const nome     = document.getElementById('projectNome').value.trim();
    const descricao = document.getElementById('projectDescricao').value.trim();

    if (!nome) { alert('O nome do projeto é obrigatório!'); return; }

    if (id) {
        const proj = projects.find(p => p.id == id);
        proj.nome     = nome;
        proj.descricao = descricao;
    } else {
        const newId = projects.length ? Math.max(...projects.map(p => p.id)) + 1 : 1;
        projects.push({ id: newId, nome, descricao });
    }

    saveData();
    bootstrap.Modal.getInstance(document.getElementById('projectModal')).hide();
    loadSection('projects');
}

function deleteProject(id) {
    if (!confirm('Excluir este projeto? Todas as tarefas associadas serão removidas.')) return;

    projects = projects.filter(p => p.id !== id);
    tasks    = tasks.filter(t => t.projectId !== id);
    saveData();
    loadSection('projects');
}

// ====================== TAREFAS ======================
function renderTasks(content) {
    content.innerHTML = `
        <div class="row mb-3">
            <div class="col-md-4">
                <select class="form-select" id="filterProject" onchange="applyFilters()">
                    <option value="">Todos os Projetos</option>
                    ${projects.map(p => `<option value="${p.id}">${p.nome}</option>`).join('')}
                </select>
            </div>
            <div class="col-md-4">
                <select class="form-select" id="filterUser" onchange="applyFilters()">
                    <option value="">Todos os Responsáveis</option>
                    ${users.map(u => `<option value="${u.id}">${u.nome}</option>`).join('')}
                </select>
            </div>
            <div class="col-md-4">
                <select class="form-select" id="filterStatus" onchange="applyFilters()">
                    <option value="">Todos os Status</option>
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluida">Concluída</option>
                </select>
            </div>
        </div>
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2>Tarefas</h2>
            <button class="btn btn-success" onclick="showTaskModal()">+ Nova Tarefa</button>
        </div>
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Projeto</th>
                        <th>Responsável</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="tasksTableBody"></tbody>
            </table>
        </div>`;

    applyFilters();
}

function applyFilters() {
    const projFilter   = document.getElementById('filterProject').value;
    const userFilter   = document.getElementById('filterUser').value;
    const statusFilter = document.getElementById('filterStatus').value;

    const filtered = tasks.filter(t =>
        (!projFilter   || t.projectId == projFilter) &&
        (!userFilter   || t.userId    == userFilter) &&
        (!statusFilter || t.status    === statusFilter)
    );

    renderTasksTable(filtered);
}

function renderTasksTable(filteredTasks) {
    const tbody = document.getElementById('tasksTableBody');

    if (filteredTasks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nenhuma tarefa encontrada</td></tr>';
        return;
    }

    tbody.innerHTML = filteredTasks.map(task => {
        const project = projects.find(p => p.id === task.projectId);
        const user    = users.find(u => u.id === task.userId);

        const badgeMap = {
            pendente:     '<span class="badge bg-danger">Pendente</span>',
            em_andamento: '<span class="badge bg-warning text-dark">Em Andamento</span>',
            concluida:    '<span class="badge bg-success">Concluída</span>'
        };

        return `
            <tr>
                <td>${task.titulo}</td>
                <td>${project ? project.nome : '—'}</td>
                <td>${user ? user.nome : '—'}</td>
                <td>
                    <select class="form-select form-select-sm" onchange="updateTaskStatus(${task.id}, this.value)">
                        <option value="pendente"     ${task.status === 'pendente'     ? 'selected' : ''}>Pendente</option>
                        <option value="em_andamento" ${task.status === 'em_andamento' ? 'selected' : ''}>Em Andamento</option>
                        <option value="concluida"    ${task.status === 'concluida'    ? 'selected' : ''}>Concluída</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-sm btn-warning me-2" onclick="editTask(${task.id})">Editar</button>
                    <button class="btn btn-sm btn-danger"        onclick="deleteTask(${task.id})">Excluir</button>
                </td>
            </tr>`;
    }).join('');
}

function showTaskModal() {
    document.getElementById('taskModalTitle').textContent = 'Nova Tarefa';
    document.getElementById('taskId').value       = '';
    document.getElementById('taskTitulo').value   = '';
    document.getElementById('taskDescricao').value = '';

    populateSelect('taskProjectId', projects, 'id', 'nome');
    populateSelect('taskUserId',    users,    'id', 'nome');

    new bootstrap.Modal(document.getElementById('taskModal')).show();
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    document.getElementById('taskModalTitle').textContent = 'Editar Tarefa';
    document.getElementById('taskId').value       = task.id;
    document.getElementById('taskTitulo').value   = task.titulo;
    document.getElementById('taskDescricao').value = task.descricao;

    populateSelect('taskProjectId', projects, 'id', 'nome');
    populateSelect('taskUserId',    users,    'id', 'nome');

    document.getElementById('taskProjectId').value = task.projectId;
    document.getElementById('taskUserId').value    = task.userId;

    new bootstrap.Modal(document.getElementById('taskModal')).show();
}

function populateSelect(selectId, array, valueKey, textKey) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Selecione...</option>' +
        array.map(item => `<option value="${item[valueKey]}">${item[textKey]}</option>`).join('');
}

function saveTask() {
    const id        = document.getElementById('taskId').value;
    const titulo    = document.getElementById('taskTitulo').value.trim();
    const descricao = document.getElementById('taskDescricao').value.trim();
    const projectId = parseInt(document.getElementById('taskProjectId').value);
    const userId    = parseInt(document.getElementById('taskUserId').value);

    if (!titulo || !projectId || !userId) { alert('Preencha todos os campos obrigatórios!'); return; }

    if (id) {
        const task = tasks.find(t => t.id == id);
        task.titulo    = titulo;
        task.descricao = descricao;
        task.projectId = projectId;
        task.userId    = userId;
    } else {
        const newId = tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
        tasks.push({ id: newId, titulo, descricao, status: 'pendente', projectId, userId });
    }

    saveData();
    bootstrap.Modal.getInstance(document.getElementById('taskModal')).hide();
    loadSection('tasks');
}

function updateTaskStatus(taskId, newStatus) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.status = newStatus;
        saveData();
    }
}

function deleteTask(id) {
    if (!confirm('Excluir esta tarefa?')) return;
    tasks = tasks.filter(t => t.id !== id);
    saveData();
    loadSection('tasks');
}

// ====================== UI / NAVBAR ======================
function closeOffcanvas() {
    const el = document.getElementById('sidebarMenu');
    const offcanvas = bootstrap.Offcanvas.getInstance(el);
    if (offcanvas) offcanvas.hide();
}

function logout() {
    localStorage.removeItem('proManage_logged');
    localStorage.removeItem('proManage_user');
    localStorage.removeItem('proManage_last_login');
    window.location.href = 'login.html';
}