# ProManage

Sistema web de gerenciamento de projetos, tarefas e equipes. Desenvolvido com HTML, CSS e JavaScript puro, utilizando Bootstrap 5 como framework de interface. Toda a persistência de dados é feita via `localStorage`, sem necessidade de banco de dados externo.

## Tecnologias

- HTML5, CSS3, JavaScript ES6+
- Bootstrap 5.3
- Font Awesome 6.5
- Node.js + Express (servidor opcional)

## Como executar

**Sem servidor — abra direto no navegador:**

Abra o arquivo `login.html` em qualquer navegador moderno.

**Com servidor Node.js:**

```bash
npm install
node index.js
```

Acesse em `http://localhost:3000`.

## Acesso padrão

```
E-mail: admin@email.com
Senha:  123456
```

Ou crie uma conta pela tela de cadastro.

## Funcionalidades

- Cadastro e login de usuários com validação completa
- Painel de controle com contadores de tarefas e projetos
- CRUD de usuários, projetos e tarefas
- Filtros de tarefas por projeto, responsável e status
- Atualização de status direto na tabela (pendente, em andamento, concluída)
- Perfil do usuário com edição de nome
- Interface responsiva com sidebar no desktop e menu offcanvas no mobile

## Estrutura do projeto

```
├── index.html       # Painel principal
├── script.js        # Lógica do painel (CRUD, navegação, filtros)
├── login.html
├── login.js
├── cadastro.html
├── cadastro.js
├── perfil.html
├── perfil.js
├── styles.css       # Estilos globais
├── login.css
├── cadastro.css
├── perfil.css
├── index.js         # Servidor Express
└── package.json
```

## Melhorias futuras

- [ ] Migrar para banco de dados real (PostgreSQL ou MongoDB)
- [ ] API REST com autenticação via JWT
- [ ] Hash de senhas com bcrypt
- [ ] Sistema de papéis: administrador, gerente e colaborador
- [ ] Controle de acesso por papel
- [ ] Redefinição de senha por e-mail
- [ ] Prazos e prioridades nas tarefas
- [ ] Visualização em quadro Kanban
- [ ] Subtarefas e comentários por tarefa
- [ ] Gráficos no dashboard com Chart.js
- [ ] Exportação de dados para CSV e PDF
- [ ] Notificações internas e por e-mail
- [ ] Tema escuro
- [ ] Busca global
- [ ] Testes automatizados com Jest
- [ ] Deploy com Docker e CI/CD via GitHub Actions

## Licença

ISC
