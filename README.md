<p align="center"> <a href="https://developer.mozilla.org/docs/Web/HTML"> <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5"/> </a> <a href="https://developer.mozilla.org/docs/Web/CSS"> <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3"/> </a> <a href="https://developer.mozilla.org/docs/Web/JavaScript"> <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/> </a> <a href="https://nodejs.org/"> <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/> </a> <a href="https://expressjs.com/"> <picture> <source srcset="https://img.shields.io/badge/Express.js-FFFFFF?style=for-the-badge&logo=express&logoColor=black" media="(prefers-color-scheme: light)" /> <source srcset="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" media="(prefers-color-scheme: dark)" /> <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js"/> </picture> </a> <a href="https://www.mongodb.com/atlas"> <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/> </a> <a href="https://tailwindcss.com/"> <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/> </a> </p><p align="center"> <img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge" alt="Version"/> <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License"/> <img src="https://img.shields.io/badge/status-active-success?style=for-the-badge" alt="Status"/> <img src="https://img.shields.io/badge/deploy-ready-brightgreen?style=for-the-badge" alt="Deploy Ready"/> </p>



# Sistema de Simulação de Rotinas Administrativas

## 📋 Sobre o Projeto
O **Sistema de Simulação de Rotinas Administrativas** é uma plataforma web educacional desenvolvida para a **Professora Lucillia**, criada para auxiliar os alunos do curso de **Assistente Administrativo** a vivenciarem, na prática, rotinas típicas do ambiente empresarial.

---

## 👩‍🏫 Contexto Educacional
- **Curso:** Assistente Administrativo  
- **Orientadora:** Professora Lucillia Magnavita  
- **Objetivo:** Proporcionar prática simulada das rotinas administrativas  
- **Público-alvo:** Alunos do curso de Assistente Administrativo  

---

## 🎯 Objetivos do Projeto
### **Educacionais**
- Simular rotinas reais do ambiente administrativo
- Oferecer experiência prática em sistemas de gestão
- Desenvolver competências administrativas diversas
- Facilitar a transição entre teoria e prática

### **Técnicos**
- Interface intuitiva e fácil de navegar
- Funcionalidades que representam processos reais
- Usabilidade para diferentes níveis de experiência tecnológica
- Feedback visual imediato das ações

---

## 🏗️ Arquitetura do Sistema
### **Estrutura de Pastas**
```
sistema-simulacao/
├── index.html              # Página principal
├── styles/
│   └── styles-index.css    # Estilos principais
├── scripts/
│   └── script.js           # Lógica principal
├── auth.js                 # Autenticação (simulação)
├── assets/                 # Recursos visuais
│   ├── senac-logo-0.png
│   └── favicon.png
└── README.md               # Documentação
```

---

## 📊 Módulos do Sistema
### **1. Dashboard Principal**
- Visão geral
- Estatísticas em tempo real
- Cards: funcionários, saldo financeiro, vendas do dia, estoque

### **2. Departamento Pessoal**
- Cadastro completo de funcionários
- Dados pessoais, contato, endereço e informações profissionais
- Listagem em tabela e gerenciamento

### **3. Financeiro**
#### **Tesouraria**
- Lançamento de entradas e saídas
- Registro detalhado das movimentações

#### **Fluxo de Caixa**
- Controle visual
- Saldo automático
- Cores diferenciadas para entradas/saídas

#### **Contas a Pagar / Receber**
- Cadastro, vencimentos, controle
- Relatórios em PDF

### **4. Vendas**
- Registro de vendas
- Nota Fiscal Eletrônica fictícia
- Relatórios e histórico completo

### **5. Estoque**
- Entrada via NF fictícia
- Controle de quantidade e valor
- Inventário, listagem e relatórios

---

## 🛠️ Tecnologias Utilizadas
### **Frontend**
- HTML5
- CSS3 (Flexbox, Grid, variáveis CSS, responsividade)
- JavaScript ES6+ (DOM, validações, LocalStorage)

### **Bibliotecas**
- Font Awesome 6.4.0
- jsPDF
- Google Fonts

### **Ferramentas**
- VS Code
- Git
- Chrome DevTools
- Live Server

---

## 🚀 Como Usar o Sistema
### **Pré-requisitos**
- Navegador atualizado
- Internet (para Font Awesome)

### **Utilização**
```bash
https://senac-lucillia.vercel.app/
```


## 📖 Guia de Uso por Módulo
### **Departamento Pessoal**
- Preencha campos obrigatórios
- Use formato correto para CPF
- Consulte e gerencie na tabela

### **Financeiro**
- Tesouraria: entradas e saídas
- Contas a pagar/receber: cadastro e relatórios

### **Vendas**
- Registrar venda
- Gerar NF-e fictícia
- Consultar histórico

### **Estoque**
- Entrada por NF
- Controle de quantidades e totalização

---

## 🔧 Funcionalidades Especiais
### **Persistência de Dados**
- LocalStorage para armazenamento
- Limpeza: `localStorage.clear()`

### **Relatórios PDF**
- Automáticos e formatados
- Disponíveis em vários módulos

### **Responsividade**
- Mobile First, tablet e desktop

### **Acessibilidade**
- Navegação por teclado
- Contraste e textos descritivos

---

## 📱 Compatibilidade
### **Navegadores Suportados**
- Chrome 80+
- Firefox 75+
- Edge 80+
- Safari 13+

### **Dispositivos Testados**
- Smartphones
- Tablets
- Notebooks/Desktops

---

## 🎓 Contexto Pedagógico
### **Competências Desenvolvidas**
- Administrativas: pessoal, financeiro, vendas, estoque
- Tecnológicas: sistemas, dados, relatórios
- Profissionais: decisão, organização, planejamento

### **Metodologia**
- Aulas práticas, exercícios, desafios
- Projetos integrados e avaliação por desempenho

---

## 🐛 Solução de Problemas
- Dados não salvam → verifique LocalStorage
- Relatórios não geram → internet/jsPDF/pop-ups
- Layout quebrado → atualizar cache e zoom
- Formulários não enviam → campos obrigatórios

---

## 📈 Expansões Futuras
- Introduzir banco de dados relacional ( MySQL ou Postgress)
- Acrescentar novos módulos (contabilidade, folha, ferias, resgistro ponto, patrimônio e etc)
- Gráficos interativos, exportação Excel
- Avaliação e gamificação

---

## 👥 Contribuição
### **Fluxo para Desenvolvedores**
```bash
git checkout -b feature/nova-funcionalidade
git commit -m 'Adiciona nova funcionalidade'
git push origin feature/nova-funcionalidade
```
Abra um Pull Request.

### **Padrões**
- Comentar funções complexas
- Manter nomenclatura consistente
- Seguir padrões de acessibilidade
- Testar em múltiplos navegadores

---

## 📄 Licença
Projeto **exclusivamente educacional**, propriedade de **Mauricio De Oliveira**.

- Proibida comercialização
- Proibida modificação sem autorização
- Uso apenas educacional
- Atribuição obrigatória

---

## 🙏 Agradecimentos
- Professora Lucillia Magnavita
- Alunos testadores
- Ferramentas e recursos open source

---

## Suporte e Contato
### **Técnico**
- Email: <manutencaomauricio81@gmail.com>

### **Pedagógico**
- Professora Lucillia Magnavita  
- Email: <lucillia_magnavita@hotmail.com>

