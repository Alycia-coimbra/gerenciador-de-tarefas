document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) registerForm.addEventListener('submit', handleRegister);

    setupRealTimeValidation();

    const nomeInput = document.getElementById('nome');
    if (nomeInput) {
        nomeInput.addEventListener('keypress', function (e) {
            if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]$/.test(String.fromCharCode(e.keyCode))) {
                e.preventDefault();
            }
        });
    }
});

// ====================== CADASTRO ======================

async function handleRegister(event) {
    event.preventDefault();

    const btn     = document.getElementById('btnRegister');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');

    btn.disabled = true;
    btnText.classList.add('d-none');
    spinner.classList.remove('d-none');

    const nome     = document.getElementById('nome').value.trim();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirm  = document.getElementById('confirmPassword').value;
    const termos   = document.getElementById('termos').checked;

    await sleep(500);

    if (!validateForm(nome, email, password, confirm, termos)) {
        btn.disabled = false;
        btnText.classList.remove('d-none');
        spinner.classList.add('d-none');
        return;
    }

    let registeredUsers = JSON.parse(localStorage.getItem('proManage_users_registered') || '[]');
    if (registeredUsers.some(u => u.email === email)) {
        showAlert('Este e-mail já está cadastrado!', 'danger');
        btn.disabled = false;
        btnText.classList.remove('d-none');
        spinner.classList.add('d-none');
        return;
    }

    const newUser = {
        id: generateUserId(),
        nome,
        email,
        password,
        createdAt: new Date().toISOString(),
        status: 'active'
    };

    registeredUsers.push(newUser);
    localStorage.setItem('proManage_users_registered', JSON.stringify(registeredUsers));

    addUserToMainSystem(newUser);

    localStorage.setItem('proManage_logged',    'true');
    localStorage.setItem('proManage_last_login', new Date().toISOString());
    localStorage.setItem('proManage_user',       JSON.stringify({
        id: newUser.id, nome: newUser.nome, email: newUser.email
    }));

    showAlert('Cadastro realizado com sucesso! Redirecionando...', 'success');
    setTimeout(() => { window.location.href = 'index.html'; }, 1500);
}

// ====================== VALIDAÇÕES ======================

function validateForm(nome, email, password, confirm, termos) {
    if (!nome || nome.length < 3) {
        showAlert('Nome deve ter pelo menos 3 caracteres!', 'danger'); return false;
    }
    if (nome.split(' ').filter(p => p.length > 0).length < 2) {
        showAlert('Digite seu nome completo (nome e sobrenome)!', 'danger'); return false;
    }
    if (!email || !isValidEmail(email)) {
        showAlert('E-mail inválido!', 'danger'); return false;
    }
    const dominiosBloqueados = ['tempmail.com', 'throwaway.com', 'mailinator.com'];
    if (dominiosBloqueados.includes(email.split('@')[1])) {
        showAlert('E-mail temporário não é permitido!', 'danger'); return false;
    }
    if (!password || password.length < 6) {
        showAlert('A senha deve ter pelo menos 6 caracteres!', 'danger'); return false;
    }
    if (password.toLowerCase().includes(nome.toLowerCase().split(' ')[0])) {
        showAlert('A senha não pode conter seu nome!', 'danger'); return false;
    }
    if (!confirm || password !== confirm) {
        showAlert('As senhas não conferem!', 'danger'); return false;
    }
    if (!termos) {
        showAlert('Você precisa aceitar os termos de uso!', 'danger'); return false;
    }
    return true;
}

function setupRealTimeValidation() {
    const nomeInput     = document.getElementById('nome');
    const emailInput    = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmInput  = document.getElementById('confirmPassword');

    if (nomeInput) {
        nomeInput.addEventListener('input', function () {
            const valido = this.value.trim().length >= 3 &&
                           this.value.trim().split(' ').filter(p => p.length > 0).length >= 2;
            this.classList.toggle('is-valid',   valido);
            this.classList.toggle('is-invalid', !valido);
        });
    }

    if (emailInput) {
        emailInput.addEventListener('input', function () {
            const email = this.value.trim();
            if (isValidEmail(email)) {
                this.classList.add('is-valid');
                this.classList.remove('is-invalid');
                checkExistingEmail(email);
            } else {
                this.classList.add('is-invalid');
                this.classList.remove('is-valid');
            }
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', function () {
            validatePasswordStrength(this.value);
            checkPasswordMatch();
        });
    }

    if (confirmInput) {
        confirmInput.addEventListener('input', checkPasswordMatch);
    }
}

function checkExistingEmail(email) {
    const users      = JSON.parse(localStorage.getItem('proManage_users_registered') || '[]');
    const emailInput = document.getElementById('email');

    if (users.some(u => u.email === email)) {
        emailInput.classList.add('is-invalid');
        emailInput.classList.remove('is-valid');
        const feedback = emailInput.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = 'Este e-mail já está cadastrado';
        }
    }
}

function validatePasswordStrength(password) {
    const passwordInput     = document.getElementById('password');
    const strengthIndicator = document.getElementById('passwordStrength');
    if (!strengthIndicator) return;

    const strength = getPasswordStrength(password);
    strengthIndicator.textContent = strength.message;
    strengthIndicator.className   = `password-hint ${strength.class}`;

    const valido = password.length >= 6 && strength.score >= 2;
    passwordInput.classList.toggle('is-valid',   valido);
    passwordInput.classList.toggle('is-invalid', !valido);
}

function getPasswordStrength(password) {
    if (password.length < 6) {
        return { message: '❌ Muito curta (mínimo 6 caracteres)', class: 'invalid', score: 0 };
    }
    let score = 0;
    if (password.match(/[a-z]+/)) score++;
    if (password.match(/[A-Z]+/)) score++;
    if (password.match(/[0-9]+/)) score++;
    if (password.match(/[^a-zA-Z0-9]+/)) score++;

    if (score < 2) return { message: '⚠️ Senha fraca (adicione números e símbolos)', class: 'invalid', score };
    if (score < 3) return { message: '👍 Senha média', class: 'valid', score };
    return { message: '✅ Senha forte', class: 'valid', score };
}

function checkPasswordMatch() {
    const password     = document.getElementById('password').value;
    const confirm      = document.getElementById('confirmPassword').value;
    const confirmInput = document.getElementById('confirmPassword');
    const feedback     = document.getElementById('confirmFeedback');

    if (!confirm) { confirmInput.classList.remove('is-valid', 'is-invalid'); return; }

    if (password === confirm) {
        confirmInput.classList.add('is-valid');
        confirmInput.classList.remove('is-invalid');
        if (feedback) feedback.textContent = '';
    } else {
        confirmInput.classList.add('is-invalid');
        confirmInput.classList.remove('is-valid');
        if (feedback) feedback.textContent = 'As senhas não conferem';
    }
}

// ====================== UTILITÁRIOS ======================

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
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>`;

    const registerBody = document.querySelector('.register-body');
    registerBody.insertBefore(alertDiv, registerBody.firstChild);

    setTimeout(() => { if (alertDiv) alertDiv.remove(); }, type === 'success' ? 5000 : 3000);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function addUserToMainSystem(newUser) {
    const users = JSON.parse(localStorage.getItem('proManage_users') || '[]');
    if (!users.some(u => u.email === newUser.email)) {
        users.push({ id: newUser.id, nome: newUser.nome, email: newUser.email });
        localStorage.setItem('proManage_users', JSON.stringify(users));
    }
}