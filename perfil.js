document.addEventListener('DOMContentLoaded', function () {
    const userData = JSON.parse(localStorage.getItem('proManage_user') || '{}');

    if (!localStorage.getItem('proManage_logged') || !userData.nome) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('profileName').textContent  = userData.nome;
    document.getElementById('profileEmail').textContent = userData.email;
    document.getElementById('navUserName').textContent  = userData.nome.split(' ')[0];
    document.getElementById('inputNome').value  = userData.nome;
    document.getElementById('inputEmail').value = userData.email;

    const initials = userData.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    document.getElementById('avatarInitials').textContent = initials;

    const lastLogin = localStorage.getItem('proManage_last_login');
    if (lastLogin) {
        const date = new Date(lastLogin).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
        document.getElementById('profileSince').textContent = 'Último acesso: ' + date;
    }

    document.getElementById('profileForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const novoNome = document.getElementById('inputNome').value.trim();

        if (novoNome.length < 3 || novoNome.split(' ').filter(p => p.length > 0).length < 2) {
            showProfileAlert('Digite seu nome completo (nome e sobrenome).', 'danger');
            return;
        }

        userData.nome = novoNome;
        localStorage.setItem('proManage_user', JSON.stringify(userData));

        document.getElementById('profileName').textContent = novoNome;
        document.getElementById('navUserName').textContent = novoNome.split(' ')[0];

        const newInitials = novoNome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        document.getElementById('avatarInitials').textContent = newInitials;

        showProfileAlert('Perfil atualizado com sucesso!', 'success');
    });
});

function showProfileAlert(msg, type) {
    const el = document.getElementById('profileAlert');
    el.innerHTML = `<div class="alert alert-${type} mt-3 mb-0">${msg}</div>`;
    setTimeout(() => { el.innerHTML = ''; }, 3000);
}

function logout() {
    localStorage.removeItem('proManage_logged');
    localStorage.removeItem('proManage_user');
    localStorage.removeItem('proManage_last_login');
    window.location.href = 'login.html';
}