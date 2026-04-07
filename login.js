document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const emailInput    = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    if (emailInput)    emailInput.addEventListener('input', validateEmail);
    if (passwordInput) passwordInput.addEventListener('input', validatePassword);
});

function handleLogin(event) {
    event.preventDefault();

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showAlert('Preencha todos os campos!', 'danger');
        return;
    }

    if (!isValidEmail(email)) {
        showAlert('E-mail inválido!', 'danger');
        return;
    }

    if (email === 'admin@email.com' && password === '123456') {
        doLogin({ nome: 'Administrador', email: 'admin@email.com' });
        return;
    }

    const users = JSON.parse(localStorage.getItem('proManage_users_registered') || '[]');
    const user  = users.find(u => u.email === email && u.password === password);

    if (user) {
        doLogin({ nome: user.nome, email: user.email });
    } else {
        showAlert('E-mail ou senha inválidos!', 'danger');
    }
}

function doLogin(userData) {
    localStorage.setItem('proManage_logged',     'true');
    localStorage.setItem('proManage_user',        JSON.stringify(userData));
    localStorage.setItem('proManage_last_login',  new Date().toISOString());

    showAlert('Login realizado com sucesso! Redirecionando...', 'success');
    setTimeout(() => { window.location.href = 'index.html'; }, 1000);
}

function validateEmail() {
    const email    = document.getElementById('email').value.trim();
    const input    = document.getElementById('email');
    const feedback = document.getElementById('emailFeedback');

    if (email && !isValidEmail(email)) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        if (feedback) feedback.textContent = 'E-mail inválido';
    } else {
        input.classList.remove('is-invalid');
        if (email) input.classList.add('is-valid');
    }
}

function validatePassword() {
    const password = document.getElementById('password').value;
    const input    = document.getElementById('password');

    if (password && password.length < 6) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
    } else {
        input.classList.remove('is-invalid');
        if (password) input.classList.add('is-valid');
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showAlert(message, type) {
    const old = document.querySelector('.alert');
    if (old) old.remove();

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>`;

    const loginBody = document.querySelector('.login-body');
    loginBody.insertBefore(alertDiv, loginBody.firstChild);

    setTimeout(() => { if (alertDiv) alertDiv.remove(); }, 3000);
}