# Agenda PHP

Uma aplicação web simples, leve e intuitiva para gerenciamento de tarefas, compromissos e anotações. O projeto foi construído usando HTML, CSS, JavaScript e PHP, com persistência de dados em arquivo JSON (sem necessidade de configurar banco de dados de início).

---

## 🎯 Funcionalidades Principais

- **Gerenciamento de Anotações (CRUD Completo):**
  - **Criar:** Adicione anotações com título, descrição, categoria, status e data/hora de vencimento.
  - **Editar:** Atualize qualquer informação de uma anotação existente por meio de um modal interativo.
  - **Excluir:** Remova anotações da lista com confirmação prévia.
  - **Alternar Status:** Altere o status entre concluído e pendente rapidamente com 1 clique no card.

- **Categorização:**
  - Separação visual por tipos: **Atividade**, **Evento**, **Reunião** e **Tarefa**, cada um com ícones e cores distintas.

- **Status Automático e Dinâmico:**
  - Status disponíveis: **Pendente**, **Concluída** e **Atrasada**.
  - O back-end em PHP calcula o prazo em tempo real e marca a anotação como **Atrasada** automaticamente caso o horário limite tenha passado e ela não esteja concluída.

- **Busca e Filtros em Tempo Real:**
  - Campo de busca por texto (filtra título e descrição enquanto você digita).
  - Filtros combinados por categoria e por status.

- **Painel de Estatísticas:**
  - Indicadores no topo da página exibindo a quantidade total de notas, concluídas, pendentes e atrasadas.

---

## 📁 Estrutura do Projeto

```text
AgendaPHP/
├── app/
│   ├── backend/
│   │   ├── api.php       # API RESTful que processa o CRUD e as regras de negócio
│   │   └── notes.json    # Arquivo onde os dados são salvos (gerado automaticamente)
│   ├── script/
│   │   └── script.js     # Lógica do front-end, manipuladores de evento e chamadas AJAX
│   ├── index.html        # Estrutura e layout da interface
│   └── style.css         # Estilização customizada e animações
└── imgs/
    └── favicon.ico       # Ícone da aplicação