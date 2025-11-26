const API_BASE = window.location.hostname.includes('localhost') ? 'http://localhost:3000' : 'https://senac-lucillia.vercel.app';

document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const resetPasswordForm = document.getElementById('reset-password-form');
    const cadastroFuncionarioForm = document.getElementById('cadastro-funcionario-form');
    const errorMessage = document.getElementById('error-message');

    if (registerForm) {
        registerForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(`${API_BASE}/api/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, email, password }),
                });

                const result = await response.json();

                if (response.ok) {
                    alert(result.message);
                    window.location.href = '/index.html';
                } else {
                    errorMessage.textContent = result.message;
                }
            } catch (error) {
                console.error('Erro ao registrar:', error);
                errorMessage.textContent = 'Erro ao conectar ao servidor.';
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(`${API_BASE}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const result = await response.json();

                if (response.ok) {
                    // Salva os dados do usuário no sessionStorage
                    sessionStorage.setItem('isLoggedIn', 'true');
                    sessionStorage.setItem('userData', JSON.stringify(result.user));
                    sessionStorage.setItem('loginResponse', JSON.stringify(result));
                    
                    alert(result.message);
                    window.location.href = '/home.html';
                } else {
                    errorMessage.textContent = result.message;
                }
            } catch (error) {
                console.error('Erro ao fazer login:', error);
                errorMessage.textContent = 'Erro ao conectar ao servidor.';
            }
        });
    }

    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const email = document.getElementById('email').value;

            try {
                const response = await fetch(`${API_BASE}/api/reset-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });

                const result = await response.json();

                if (response.ok) {
                    alert(result.message);
                    window.location.href = '/index.html';
                } else {
                    errorMessage.textContent = result.message;
                }
            } catch (error) {
                console.error('Erro ao solicitar redefinição de senha:', error);
                errorMessage.textContent = 'Erro ao conectar ao servidor.';
            }
        });
    }

    if (cadastroFuncionarioForm) {
        cadastroFuncionarioForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const nome = document.getElementById('nome').value;
            const cpf = document.getElementById('cpf').value;
            const rg = document.getElementById('rg').value;
            const filiacao = document.getElementById('filiacao').value;
            const cep = document.getElementById('cep').value;
            const logradouro = document.getElementById('logradouro').value;
            const numero = document.getElementById('numero').value;
            const bairro = document.getElementById('bairro').value;
            const cidade = document.getElementById('cidade').value;
            const estado = document.getElementById('estado').value;
            const telefone = document.getElementById('telefone').value;
            const email = document.getElementById('email').value;
            const cargo_admitido = document.getElementById('cargo_admitido').value;
            const salario = document.getElementById('salario').value;

            try {
                const response = await fetch(`${API_BASE}/api/funcionarios`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nome, cpf, rg, filiacao, cep, logradouro, numero, bairro,
                        cidade, estado, telefone, email, cargo_admitido, salario
                    }),
                });

                const result = await response.json();

                if (response.ok) {
                    alert(result.message);
                    cadastroFuncionarioForm.reset();
                } else {
                    errorMessage.textContent = result.message;
                }
            } catch (error) {
                console.error('Erro ao cadastrar funcionário:', error);
                errorMessage.textContent = 'Erro ao conectar ao servidor.';
            }
        });
    }

    // Verifica se está na página home e carrega o nome do usuário
    if (window.location.pathname.includes('home.html')) {
        loadUserName();
    }
});

// Função para carregar nome do usuário (também disponível globalmente)
function loadUserName() {
    console.log('🔍 Tentando carregar nome do usuário...');
    
    // Primeiro tenta do userData
    const userData = sessionStorage.getItem('userData');
    console.log('userData do sessionStorage:', userData);
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            console.log('Usuário encontrado:', user);
            document.getElementById('user-name').textContent = user.nome || user.email;
            return;
        } catch (e) {
            console.error('Erro ao parsear userData:', e);
        }
    }
    
    // Se não encontrou, tenta do loginResponse
    const loginData = sessionStorage.getItem('loginResponse');
    console.log('loginResponse do sessionStorage:', loginData);
    
    if (loginData) {
        try {
            const data = JSON.parse(loginData);
            if (data.user) {
                console.log('Usuário do loginResponse:', data.user);
                document.getElementById('user-name').textContent = data.user.nome || data.user.email;
                // Salva no userData para próxima vez
                sessionStorage.setItem('userData', JSON.stringify(data.user));
                return;
            }
        } catch (e) {
            console.error('Erro ao parsear loginResponse:', e);
        }
    }
    
    // Se não encontrou em nenhum lugar, mostra padrão
    console.log('❌ Nenhum dado de usuário encontrado');
    document.getElementById('user-name').textContent = 'Usuário';
}