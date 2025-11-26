const API_BASE = window.location.hostname.includes('localhost') ? 'http://localhost:3000' : 'https://senac-lucillia.vercel.app';


document.addEventListener("DOMContentLoaded", function () {
    let isLoggedIn = sessionStorage.getItem('isLoggedIn');


    if (isLoggedIn !== 'true') {
        window.location.href = './index.html';
    } else {
        initNavigation();
        initCEPValidation();
        initCPFValidation();
        initFormCompletionCheck();  
        initTesouraria();
        initEstoque();
        initVendas();
        initContasPagar();
        initContasReceber();
        atualizarFluxoCaixa();
        setupLogout();
        loadUserName();
        loadDashboardStats();
        initSubNavigation();
        loadFuncionariosList();
    }
});

// Função para carregar nome do usuário
function loadUserName() {
    const userData = sessionStorage.getItem('userData');
    if (userData) {
        const user = JSON.parse(userData);
        document.getElementById('user-name').textContent = user.nome || user.email;
    } else {
        // Tenta buscar da resposta do login
        const loginData = sessionStorage.getItem('loginResponse');
        if (loginData) {
            const data = JSON.parse(loginData);
            if (data.user) {
                document.getElementById('user-name').textContent = data.user.nome || data.user.email;
                sessionStorage.setItem('userData', JSON.stringify(data.user));
            }
        }
    }
}

// Função para carregar estatísticas do dashboard
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE}/api/dashboard/stats`);
        const data = await response.json();
        
        if (data.success) {
            const stats = data.stats;
            
            // Atualizar os elementos do dashboard
            document.getElementById('total-funcionarios').textContent = stats.totalFuncionarios;
            document.getElementById('saldo-atual').textContent = `R$ ${stats.saldoAtual.toFixed(2)}`;
            document.getElementById('vendas-hoje').textContent = stats.totalVendasHoje;
            document.getElementById('itens-estoque').textContent = stats.itensEstoque;
        }
    } catch (err) {
        console.error('Erro ao carregar estatísticas:', err);
    }
}

// 1. Navegação entre seções
function initNavigation() {
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("main section");

    // Função para mostrar uma seção específica
    function showSection(sectionId) {
        // Remove a classe 'active' de todas as seções e links
        sections.forEach(section => {
            section.classList.remove("active");
        });
        navLinks.forEach(link => {
            link.classList.remove("active");
        });

        // Adiciona a classe 'active' à seção e link correspondentes
        const targetSection = document.getElementById(sectionId);
        const targetLink = document.querySelector(`a[href="#${sectionId}"]`);
        
        if (targetSection && targetLink) {
            targetSection.classList.add("active");
            targetLink.classList.add("active");
        }
    }

    // Adiciona evento de clique a todos os links de navegação
    navLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            const targetId = this.getAttribute("href").substring(1); // Remove o #
            showSection(targetId);
        });
    });

    // Mostra a seção Home por padrão
    showSection('home');
}

// Funções para subnavegação do Departamento Pessoal
function initSubNavigation() {
    const subnavButtons = document.querySelectorAll('.subnav-btn');
    const subsections = document.querySelectorAll('.subsection');
    
    subnavButtons.forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            
            // Remove active de todos os botões e seções
            subnavButtons.forEach(btn => btn.classList.remove('active'));
            subsections.forEach(section => section.classList.remove('active'));
            
            // Adiciona active ao botão e seção clicados
            this.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });
}

// 2. Validação e preenchimento automático de CEP
function initCEPValidation() {
    const cepInput = document.getElementById("cep");
    const logradouroInput = document.getElementById("logradouro");
    const bairroInput = document.getElementById("bairro");
    const cidadeInput = document.getElementById("cidade");
    const estadoInput = document.getElementById("estado");

    const tiposLogradouro = ["Rua", "Avenida", "Praça", "Travessa", "Alameda", "Rodovia", "Estrada", "Vila"];

    // Formatação dinâmica do CEP
    cepInput.addEventListener("input", function () {
        let cep = this.value.replace(/\D/g, ""); // Remove caracteres não numéricos
        if (cep.length > 8) cep = cep.slice(0, 8); // Garante no máximo 8 dígitos

        if (cep.length >= 5) {
            this.value = `${cep.slice(0, 5)}-${cep.slice(5)}`;
        } else {
            this.value = cep;
        }
    });

    // Busca o endereço ao perder o foco do campo CEP
    cepInput.addEventListener("blur", function () {
        let cep = this.value.replace(/\D/g, "");

        if (cep.length !== 8) {
            alert("CEP inválido! Digite um CEP com 8 dígitos.");
            return;
        }

        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (data.erro) {
                    alert("CEP não encontrado. Preencha os dados manualmente.");
                    return;
                }

                let logradouro = data.logradouro || "";
                let partesLogradouro = logradouro.split(" ");
                let tipoLogradouro = "Rua";

                if (partesLogradouro.length > 1 && tiposLogradouro.includes(partesLogradouro[0])) {
                    tipoLogradouro = partesLogradouro.shift();
                    logradouro = partesLogradouro.join(" ");
                }

                logradouroInput.value = `${tipoLogradouro} ${logradouro}`;
                bairroInput.value = data.bairro;
                cidadeInput.value = data.localidade;
                estadoInput.value = data.uf;

                // Desabilita os campos após o preenchimento automático
                logradouroInput.disabled = true;
                bairroInput.disabled = true;
                cidadeInput.disabled = true;
                estadoInput.disabled = true;
            })
            .catch(error => console.error("Erro ao buscar CEP:", error));
    });
}

// 3. Validação e formatação de CPF
function initCPFValidation() {
    const cpfInput = document.getElementById("cpf");
    const errorMessage = document.getElementById("error-message");

    // Formatação do CPF
    cpfInput.addEventListener("input", () => {
        let cpf = cpfInput.value.replace(/\D/g, ""); // Remove caracteres não numéricos
        if (cpf.length > 11) cpf = cpf.slice(0, 11); // Limita a 11 dígitos

        // Formata o CPF
        if (cpf.length >= 3) cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
        if (cpf.length >= 6) cpf = cpf.replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
        if (cpf.length >= 9) cpf = cpf.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");

        cpfInput.value = cpf; // Atualiza o valor do campo com o CPF formatado
    });

    // Validação do CPF
    cpfInput.addEventListener("blur", () => {
        let cpf = cpfInput.value.replace(/\D/g, "");

        if (cpf.length === 11) {
            if (!validarCPF(cpf)) {
                errorMessage.textContent = "CPF inválido! Por favor, insira um CPF válido.";
                errorMessage.style.color = "red";
            } else {
                errorMessage.textContent = "";
            }
        } else {
            errorMessage.textContent = "CPF sem os 11 digitos! Por favor, insira um CPF válido.";
            errorMessage.style.color = "red";
        }
    });
}

// Função para validar CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, "");

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    return resto === parseInt(cpf.charAt(10));
}

// 4. Verificação de preenchimento do formulário
function initFormCompletionCheck() {
    const form = document.getElementById('cadastro-funcionario-form');
    const submitBtn = document.getElementById('submit-btn');
    const requiredFields = form.querySelectorAll('[required]');

    function checkFormCompletion() {
        let allFilled = true;
        requiredFields.forEach(field => {
            if (!field.value.trim()) allFilled = false;
        });
        submitBtn.disabled = !allFilled;
    }

    requiredFields.forEach(field => {
        field.addEventListener('input', checkFormCompletion);
    });

    checkFormCompletion();
}

// Função para carregar lista de funcionários
async function loadFuncionariosList() {
    try {
        const response = await fetch(`${API_BASE}/api/funcionarios`);
        const data = await response.json();
        
        if (data.success) {
            const tbody = document.getElementById('funcionarios-tbody');
            tbody.innerHTML = '';
            
            data.funcionarios.forEach(funcionario => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${funcionario.nome}</td>
                    <td>${funcionario.cpf}</td>
                    <td>${funcionario.cargo_admitido}</td>
                    <td>R$ ${parseFloat(funcionario.salario).toFixed(2)}</td>
                    <td>${new Date(funcionario.data_admissao).toLocaleDateString('pt-BR')}</td>
                    <td class="actions">
                        <button class="btn btn-sm btn-edit" onclick="editFuncionario('${funcionario._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-delete" onclick="deleteFuncionario('${funcionario._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (err) {
        console.error('Erro ao carregar lista de funcionários:', err);
    }
}

// Função para buscar funcionários
async function searchFuncionarios() {
    const searchTerm = document.getElementById('search-input').value.trim();
    const resultsDiv = document.getElementById('search-results');
    
    if (!searchTerm) {
        resultsDiv.innerHTML = '<p class="no-results">Digite um termo para buscar</p>';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/funcionarios`);
        const data = await response.json();
        
        if (data.success) {
            const filtered = data.funcionarios.filter(funcionario => 
                funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                funcionario.cpf.includes(searchTerm) ||
                funcionario.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            if (filtered.length === 0) {
                resultsDiv.innerHTML = '<p class="no-results">Nenhum funcionário encontrado</p>';
                return;
            }
            
            resultsDiv.innerHTML = filtered.map(funcionario => `
                <div class="search-result-item">
                    <div class="result-info">
                        <h4>${funcionario.nome}</h4>
                        <p><strong>CPF:</strong> ${funcionario.cpf}</p>
                        <p><strong>Cargo:</strong> ${funcionario.cargo_admitido}</p>
                        <p><strong>E-mail:</strong> ${funcionario.email}</p>
                    </div>
                    <div class="result-actions">
                        <button class="btn btn-sm btn-edit" onclick="editFuncionario('${funcionario._id}')">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Erro ao buscar funcionários:', err);
        resultsDiv.innerHTML = '<p class="error-message">Erro ao buscar funcionários</p>';
    }
}

// Função para editar funcionário
async function editFuncionario(id) {
    try {
        const response = await fetch(`${API_BASE}/api/funcionarios/${id}`);
        const data = await response.json();
        
        if (data.success) {
            const funcionario = data.funcionario;
            
            // Preenche o formulário com os dados do funcionário
            document.getElementById('nome').value = funcionario.nome;
            document.getElementById('cpf').value = funcionario.cpf;
            document.getElementById('rg').value = funcionario.rg;
            document.getElementById('filiacao').value = funcionario.filiacao;
            document.getElementById('cep').value = funcionario.cep;
            document.getElementById('logradouro').value = funcionario.logradouro;
            document.getElementById('numero').value = funcionario.numero;
            document.getElementById('bairro').value = funcionario.bairro;
            document.getElementById('cidade').value = funcionario.cidade;
            document.getElementById('estado').value = funcionario.estado;
            document.getElementById('telefone').value = funcionario.telefone;
            document.getElementById('email').value = funcionario.email;
            document.getElementById('cargo_admitido').value = funcionario.cargo_admitido;
            document.getElementById('salario').value = funcionario.salario;
            document.getElementById('data_admissao').value = funcionario.data_admissao.split('T')[0];
            
            // Habilita campos desabilitados pelo CEP
            document.getElementById('logradouro').disabled = false;
            document.getElementById('bairro').disabled = false;
            document.getElementById('cidade').disabled = false;
            document.getElementById('estado').disabled = false;
            
            // Muda para a aba de cadastro
            document.querySelector('[data-target="cadastro-funcionario"]').click();
            
            // Altera o formulário para modo edição
            const form = document.getElementById('cadastro-funcionario-form');
            form.setAttribute('data-edit-mode', 'true');
            form.setAttribute('data-edit-id', id);
            
            const submitBtn = document.getElementById('submit-btn');
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Atualizar Funcionário';
            submitBtn.disabled = false;
            
            alert('Formulário preenchido com os dados do funcionário. Faça as alterações necessárias e clique em "Atualizar Funcionário".');
        }
    } catch (err) {
        console.error('Erro ao carregar funcionário para edição:', err);
        alert('Erro ao carregar dados do funcionário');
    }
}

// Função para deletar funcionário
async function deleteFuncionario(id) {
    if (!confirm('Tem certeza que deseja deletar este funcionário?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/funcionarios/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Funcionário deletado com sucesso!');
            loadFuncionariosList();
            loadDashboardStats(); // Atualiza as estatísticas
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error('Erro ao deletar funcionário:', err);
        alert('Erro ao deletar funcionário');
    }
}

// Modificar o event listener do formulário para suportar edição
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('cadastro-funcionario-form');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const isEditMode = this.getAttribute('data-edit-mode') === 'true';
        const funcionarioId = this.getAttribute('data-edit-id');
        
        const formData = {
            nome: document.getElementById('nome').value,
            cpf: document.getElementById('cpf').value,
            rg: document.getElementById('rg').value,
            filiacao: document.getElementById('filiacao').value,
            cep: document.getElementById('cep').value,
            logradouro: document.getElementById('logradouro').value,
            numero: document.getElementById('numero').value,
            bairro: document.getElementById('bairro').value,
            cidade: document.getElementById('cidade').value,
            estado: document.getElementById('estado').value,
            telefone: document.getElementById('telefone').value,
            email: document.getElementById('email').value,
            cargo_admitido: document.getElementById('cargo_admitido').value,
            salario: document.getElementById('salario').value,
            data_admissao: document.getElementById('data_admissao').value
        };
        
        try {
            const url = isEditMode ? `/funcionarios/${funcionarioId}` : '/funcionarios';
            const method = isEditMode ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert(result.message);
                
                if (isEditMode) {
                    // Reseta o formulário após edição
                    this.reset();
                    this.removeAttribute('data-edit-mode');
                    this.removeAttribute('data-edit-id');
                    document.getElementById('submit-btn').innerHTML = '<i class="fas fa-save"></i> Cadastrar Funcionário';
                    document.getElementById('submit-btn').disabled = true;
                } else {
                    this.reset();
                    document.getElementById('submit-btn').disabled = true;
                }
                
                // Atualiza as listas e estatísticas
                loadFuncionariosList();
                loadDashboardStats();
                
            } else {
                document.getElementById('error-message').textContent = result.message;
            }
        } catch (error) {
            console.error('Erro ao salvar funcionário:', error);
            document.getElementById('error-message').textContent = 'Erro ao conectar ao servidor.';
        }
    });
    
    // Event listeners para busca
    document.getElementById('search-btn').addEventListener('click', searchFuncionarios);
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchFuncionarios();
        }
    });
    
    document.getElementById('refresh-funcionarios').addEventListener('click', loadFuncionariosList);
});

// Função para enviar dados de tesouraria
function initTesouraria() {
    const tesourariaForm = document.getElementById('tesouraria-form');
    if (tesourariaForm) {
        tesourariaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const tipo = document.getElementById('tipo').value;
            const valor = parseFloat(document.getElementById('valor').value);
            const descricao = document.getElementById('descricao').value;

            if (!tipo || isNaN(valor) || !descricao) {
                alert("Preencha todos os campos corretamente!");
                return;
            }

            try {
                const response = await fetch(`${API_BASE}/api/tesouraria`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tipo, valor, descricao })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Lançamento realizado com sucesso!');
                    atualizarFluxoCaixa();
                    loadDashboardStats();
                    // Limpa apenas os campos de valor e descrição, mantendo o tipo selecionado
                    document.getElementById('valor').value = '';
                    document.getElementById('descricao').value = '';
                } else {
                    alert(data.message || 'Erro ao realizar lançamento.');
                }
            } catch (err) {
                console.error('Erro ao enviar dados:', err);
                alert('Erro na comunicação com o servidor.');
            }
        });
    }

    // Botão gerar relatório financeiro
    const gerarRelatorioBtn = document.getElementById('gerar-relatorio-financeiro');
    if (gerarRelatorioBtn) {
        gerarRelatorioBtn.addEventListener('click', () => {
            window.open('/relatorio-financeiro', '_blank');
        });
    }
}

// Função para atualizar o fluxo de caixa
async function atualizarFluxoCaixa() {
    try {
        const response = await fetch(`${API_BASE}/api/tesouraria`);
        const data = await response.json();
        const lancamentos = data.lancamentos;

        let entradas = 0;
        let saidas = 0;

        lancamentos.forEach(lancamento => {
            if (lancamento.tipo === 'entrada') {
                entradas += parseFloat(lancamento.valor);
            } else {
                saidas += parseFloat(lancamento.valor);
            }
        });

        const saldoFinal = entradas - saidas;

        document.getElementById('entradas').textContent = entradas.toFixed(2);
        document.getElementById('saidas').textContent = saidas.toFixed(2);
        document.getElementById('saldo-final').textContent = saldoFinal.toFixed(2);
    } catch (err) {
        console.error('Erro ao atualizar fluxo de caixa:', err);
    }
}

// Função para contas a pagar
function initContasPagar() {
    const formContaPagar = document.getElementById('form-conta-pagar');
    if (formContaPagar) {
        formContaPagar.addEventListener('submit', async (e) => {
            e.preventDefault();
            const descricao = document.getElementById('descricao-pagar').value;
            const valor = parseFloat(document.getElementById('valor-pagar').value);
            const vencimento = document.getElementById('vencimento-pagar').value;

            try {
                const response = await fetch(`${API_BASE}/api/contas-pagar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ descricao, valor, vencimento })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Conta a pagar cadastrada com sucesso!');
                    formContaPagar.reset();
                    carregarContasPagar();
                } else {
                    alert(data.message || 'Erro ao cadastrar conta.');
                }
            } catch (err) {
                console.error('Erro ao cadastrar conta a pagar:', err);
                alert('Erro na comunicação com o servidor.');
            }
        });
    }

    carregarContasPagar();
}

async function carregarContasPagar() {
    try {
        const response = await fetch(`${API_BASE}/api/contas-pagar`);
        const data = await response.json();
        
        if (data.success) {
            const lista = document.getElementById('lista-contas-pagar');
            lista.innerHTML = '';
            
            data.contas.forEach(conta => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <strong>${conta.descricao}</strong> - 
                    R$ ${parseFloat(conta.valor).toFixed(2)} - 
                    Vencimento: ${new Date(conta.vencimento).toLocaleDateString('pt-BR')} -
                    <span class="status-${conta.status}">${conta.status}</span>
                `;
                lista.appendChild(li);
            });
        }
    } catch (err) {
        console.error('Erro ao carregar contas a pagar:', err);
    }
}

// Função para contas a receber
function initContasReceber() {
    const formContaReceber = document.getElementById('form-conta-receber');
    if (formContaReceber) {
        formContaReceber.addEventListener('submit', async (e) => {
            e.preventDefault();
            const descricao = document.getElementById('descricao-receber').value;
            const valor = parseFloat(document.getElementById('valor-receber').value);
            const vencimento = document.getElementById('vencimento-receber').value;

            try {
                const response = await fetch(`${API_BASE}/api/contas-receber`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ descricao, valor, vencimento })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Conta a receber cadastrada com sucesso!');
                    formContaReceber.reset();
                    carregarContasReceber();
                } else {
                    alert(data.message || 'Erro ao cadastrar conta.');
                }
            } catch (err) {
                console.error('Erro ao cadastrar conta a receber:', err);
                alert('Erro na comunicação com o servidor.');
            }
        });
    }

    carregarContasReceber();
}

async function carregarContasReceber() {
    try {
        const response = await fetch(`${API_BASE}/api/contas-receber`);
        const data = await response.json();
        
        if (data.success) {
            const lista = document.getElementById('lista-contas-receber');
            lista.innerHTML = '';
            
            data.contas.forEach(conta => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <strong>${conta.descricao}</strong> - 
                    R$ ${parseFloat(conta.valor).toFixed(2)} - 
                    Vencimento: ${new Date(conta.vencimento).toLocaleDateString('pt-BR')} -
                    <span class="status-${conta.status}">${conta.status}</span>
                `;
                lista.appendChild(li);
            });
        }
    } catch (err) {
        console.error('Erro ao carregar contas a receber:', err);
    }
}

// Função para vendas
function initVendas() {
    const formVenda = document.getElementById('cadastro-venda-form');
    if (formVenda) {
        formVenda.addEventListener('submit', async (e) => {
            e.preventDefault();
            const cliente = document.getElementById('cliente-venda').value;
            const produto = document.getElementById('produto-venda').value;
            const valor = parseFloat(document.getElementById('valor-venda').value);

            try {
                const response = await fetch(`${API_BASE}/api/vendas`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cliente, produto, valor })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Venda registrada com sucesso!');
                    formVenda.reset();
                    carregarUltimaVenda(data.venda);
                    loadDashboardStats();
                } else {
                    alert(data.message || 'Erro ao registrar venda.');
                }
            } catch (err) {
                console.error('Erro ao registrar venda:', err);
                alert('Erro na comunicação com o servidor.');
            }
        });
    }
}

function carregarUltimaVenda(venda) {
    const notaFiscal = document.getElementById('nota-fiscal');
    notaFiscal.innerHTML = `
        <div class="nota-fiscal-content">
            <h3>NOTA FISCAL</h3>
            <p><strong>Número:</strong> ${venda.numeroNota}</p>
            <p><strong>Cliente:</strong> ${venda.cliente}</p>
            <p><strong>Produto:</strong> ${venda.produto}</p>
            <p><strong>Valor:</strong> R$ ${parseFloat(venda.valor).toFixed(2)}</p>
            <p><strong>Data:</strong> ${new Date(venda.data).toLocaleString('pt-BR')}</p>
        </div>
    `;
}

// Função para estoque
function initEstoque() {
    const formEstoque = document.getElementById('cadastro-entrada-estoque-form');
    if (formEstoque) {
        formEstoque.addEventListener('submit', async (e) => {
            e.preventDefault();
            const produto = document.getElementById('produto-estoque').value;
            const quantidade = parseInt(document.getElementById('quantidade-estoque').value);
            const valor_unitario = parseFloat(document.getElementById('valor-unitario-estoque').value);
            const nota_fiscal = document.getElementById('nota-fiscal-estoque').value;

            try {
                const response = await fetch(`${API_BASE}/estoque`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ produto, quantidade, valor_unitario, nota_fiscal })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Entrada no estoque registrada com sucesso!');
                    formEstoque.reset();
                    carregarEntradasEstoque();
                    loadDashboardStats();
                } else {
                    alert(data.message || 'Erro ao registrar entrada no estoque.');
                }
            } catch (err) {
                console.error('Erro ao registrar entrada no estoque:', err);
                alert('Erro na comunicação com o servidor.');
            }
        });
    }

    carregarEntradasEstoque();
}

async function carregarEntradasEstoque() {
    try {
        const response = await fetch(`${API_BASE}/api/estoque`);
        const data = await response.json();
        
        if (data.success) {
            const lista = document.getElementById('lista-entradas-estoque');
            lista.innerHTML = '';
            
            data.estoque.forEach(entrada => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <strong>${entrada.produto}</strong> - 
                    Quantidade: ${entrada.quantidade} - 
                    Valor Unitário: R$ ${parseFloat(entrada.valor_unitario).toFixed(2)} -
                    Total: R$ ${parseFloat(entrada.valor_total).toFixed(2)} -
                    NF: ${entrada.nota_fiscal} -
                    Data: ${new Date(entrada.data_entrada).toLocaleDateString('pt-BR')}
                `;
                lista.appendChild(li);
            });
        }
    } catch (err) {
        console.error('Erro ao carregar entradas de estoque:', err);
    }
}

function setupLogout() {
    const logoutButton = document.getElementById('logout-button');
    
    if (!logoutButton) {
        console.error('❌ Botão de logout não encontrado no DOM');
        return;
    }

    logoutButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        console.log('🚪 Iniciando logout...');
        
        // Limpa toda a sessão (mais completo)
        sessionStorage.clear();
        localStorage.removeItem('isLoggedIn'); // Se estiver usando localStorage também
        
        console.log('✅ Sessão limpa. Redirecionando...');
        
        // Redireciona após um pequeno delay para ver os logs
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 100);
    });

    console.log('✅ Logout configurado com sucesso');
}