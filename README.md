# 🚀 CheckFlow

Sistema web corporativo desenvolvido para gerenciamento, acompanhamento e padronização de checklists operacionais, com foco em produtividade, rastreabilidade e controle administrativo.

---

# 📌 Visão Geral

O **CheckFlow** nasceu da necessidade de transformar checklists operacionais em um sistema centralizado, intuitivo e escalável, substituindo processos manuais realizados em planilhas Excel.

O sistema permite:

* gerenciamento de tarefas operacionais;
* acompanhamento de processos por competência;
* controle por estados e filiais;
* dashboards gerenciais;
* histórico completo de execuções;
* autenticação segura de usuários;
* controle administrativo de acessos.

---

# 🏢 Objetivo do Projeto

O projeto foi idealizado para auxiliar equipes operacionais e administrativas na execução e acompanhamento de processos internos, trazendo:

* padronização operacional;
* rastreabilidade;
* controle de produtividade;
* organização centralizada;
* facilidade para novos colaboradores.

---

# 🛠️ Tecnologias Utilizadas

🔹 Front-End - 
 HTML5 - 
 CSS3 - 
JavaScript Vanilla

🔹 Back-End - 
Node.js
Express.js

🔹 Banco de Dados - 
PostgreSQL

🔹 Segurança - 
JWT - 
bcrypt - 

🔹 Versionamento
Git - 
GitHub

---

# 🧠 Arquitetura

O projeto utiliza uma arquitetura modular baseada em:

* Controllers
* Repository Pattern
* Rotas separadas
* Middleware de autenticação
* API REST

Estrutura principal:

```bash
Back-End/
 ├── Src/
 │    ├── controllers.js
 │    ├── routes.js
 │    ├── db.js
 │    ├── middlewares/
 │    ├── repositorios/
 │    └── server.js
 │
 ├── migrar-senhas.js
 ├── package.json
 └── .env

Front-End/
 ├── HTML/
 ├── CSS/
 ├── JS/
 └── assets/
```

---

# 🔐 Segurança

O sistema utiliza:

* autenticação JWT;
* hash de senha com bcrypt;
* middleware de autenticação;
* controle de acesso por perfil;
* rotas protegidas;
* separação entre usuários admin e analistas.

---

# 👥 Controle de Usuários

Perfis disponíveis:

* Admin
* Analista

Funcionalidades administrativas:

* criação de usuários;
* ativação/desativação;
* gerenciamento de áreas;
* controle de permissões.

---

# 📊 Funcionalidades

## ✔ Checklist Operacional

* seleção de processo;
* seleção de estados;
* seleção de filiais;
* controle de tarefas;
* finalização de checklist.

## ✔ Histórico

* histórico completo de execuções;
* ordenação por data;
* filtro por usuário;
* persistência no PostgreSQL.

## ✔ Dashboard

* total de checklists;
* taxa de conclusão;
* tarefas concluídas;
* agrupamento por processo;
* agrupamento por usuário;
* filtros por período.

## ✔ Administração

* gerenciamento de usuários;
* controle de acesso;
* áreas administrativas.

---

# 🗄️ Banco de Dados

Principais tabelas:

* usuarios
* areas
* checklists
* checklist_tarefas
* checklist_estados
* checklist_filiais

---

# 🚀 Como Executar o Projeto

## 1. Clonar repositório

```bash
git clone <url-do-repositorio>
```

---

## 2. Instalar dependências

```bash
npm install
```

---

## 3. Configurar `.env`

```env
JWT_SECRET=sua_chave_jwt
```

---

## 4. Executar backend

```bash
node Src/server.js
```

ou

```bash
npx nodemon Src/server.js
```

---

## 5. Abrir Front-End

Abrir o arquivo:

```bash
Front-End/HTML/index.html
```

---

# 🔄 Migração de Senhas

O projeto possui script para migração de senhas antigas para bcrypt:

```bash
node migrar-senhas.js
```

---

# 📌 Roadmap

## Próximas melhorias

* logs e auditoria;
* gráficos avançados;
* React;
* responsividade mobile;
* exportação Excel/PDF;
* integração com Microsoft Teams;
* integração com Outlook;
* deploy cloud;
* MFA;
* permissões avançadas.

---

# 📷 Preview

## Login

* autenticação JWT
* controle de sessão
* perfis administrativos

## Dashboard

* métricas operacionais
* indicadores de produtividade

## Histórico

* rastreabilidade completa

---

# 👨‍💻 Autor

Lucas Maciel de Oliveira

Projeto desenvolvido com foco em aprendizado, arquitetura corporativa e automação operacional.
