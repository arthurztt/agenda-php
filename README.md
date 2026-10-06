# Agenda PHP
 
Uma aplicação web simples, leve e intuitiva para gerenciamento de tarefas, compromissos e anotações. O projeto foi construído usando HTML, CSS, JavaScript e PHP, com persistência de dados em arquivo JSON (sem necessidade de configurar banco de dados de início).
 
---


## 🚀 Como Rodar
 
A Agenda PHP é um site que precisa de um **servidor PHP** para funcionar. Não abra o `index.html` com dois cliques: a página abre, mas a lista fica vazia e nenhuma ação funciona, porque o PHP só roda dentro de um servidor.
 
### O que você precisa
 
- **PHP 8 ou mais novo** (testado com o PHP 8.3).
- **Um navegador atual** (Chrome, Edge, Firefox).
- **Internet.** O visual usa Tailwind CSS e Font Awesome carregados por CDN. Sem internet, a página abre sem cores e sem ícones.
Para saber se o PHP já está instalado, rode no terminal:
 
```bash
php -v
```
 
Se aparecer a versão, siga para o passo a passo. Se não, instale o PHP:
 
| Sistema | Como instalar |
|---|---|
| Windows | Baixe em [php.net/downloads](https://www.php.net/downloads) e adicione a pasta do PHP ao `PATH`. Ou instale o [XAMPP](https://www.apachefriends.org) (veja a alternativa abaixo). |
| macOS | `brew install php` |
| Ubuntu / Debian | `sudo apt install php-cli` |
 
### Passo a passo (servidor embutido do PHP)
 
1. **Abra o terminal na pasta do projeto**, a pasta `AgendaPHP`, que contém `app/` e `imgs/`.
```bash
   cd caminho/para/AgendaPHP
```
 
2. **Inicie o servidor.** Use este comando, que já ajusta o fuso horário (veja a nota abaixo):
```bash
   php -d date.timezone=America/Fortaleza -S localhost:8000
```
 
3. **Abra no navegador:**
```text
   http://localhost:8000/app/index.html
```
 
4. **Para parar o servidor**, volte ao terminal e pressione `Ctrl + C`.
> **Rode na pasta `AgendaPHP`, não dentro de `app/`.** A página busca o ícone da aba em `../imgs/favicon.ico`. Se o servidor for iniciado dentro de `app/`, o aplicativo funciona, mas o ícone não aparece.
 
> **Por que o fuso horário?** O PHP usa o fuso do servidor para decidir se uma tarefa está atrasada. Se o fuso for UTC (o padrão em muitas instalações), uma tarefa marcada para daqui a 1 ou 2 horas em Fortaleza já aparece como **Atrasada**. O parâmetro `-d date.timezone=America/Fortaleza` corrige isso sem mudar o código. Se você mora em outro fuso, troque o valor.
 
### Alternativa: XAMPP (Windows)
 
1. Instale o [XAMPP](https://www.apachefriends.org).
2. Copie a pasta `AgendaPHP` para `C:\xampp\htdocs\`.
3. No painel do XAMPP, clique em **Start** no módulo **Apache**.
4. Abra `http://localhost/AgendaPHP/app/index.html`.
5. Para corrigir o fuso horário, abra o `php.ini` pelo painel (**Config** do Apache), defina `date.timezone = America/Fortaleza` e reinicie o Apache.
### Onde ficam os dados
 
Os compromissos são salvos em `app/backend/notes.json`. O arquivo é criado sozinho se não existir. Para apagar tudo e recomeçar, pare o servidor e deixe o conteúdo do arquivo como `[]`.
 
O PHP precisa de permissão para **escrever** nesse arquivo. Com o servidor embutido isso já vale, porque ele roda com o seu usuário.
 
### Problemas comuns
 
| O que acontece | Causa provável | O que fazer |
|---|---|---|
| `php` não é reconhecido como comando | O PHP não está instalado ou não está no `PATH` | Instale o PHP, reabra o terminal e rode `php -v`. No XAMPP, use `C:\xampp\php\php.exe`. |
| `http://localhost:8000` mostra erro 404 | A raiz do projeto não tem página | Abra `http://localhost:8000/app/index.html`. |
| Aparece "Erro de conexão com o servidor PHP" | A página foi aberta sem servidor (`file://`) ou o servidor parou | Inicie o servidor e abra pelo endereço `http://localhost:8000/app/index.html`. |
| A página abre sem cores e sem ícones | Sem internet (Tailwind e Font Awesome vêm por CDN) | Conecte-se à internet e atualize a página. |
| `Failed to listen on localhost:8000` | A porta 8000 já está em uso | Use outra porta, por exemplo `-S localhost:8080`, e abra `http://localhost:8080/app/index.html`. |
| Tarefas aparecem como "Atrasada" antes da hora | O PHP está em outro fuso horário | Inicie com `-d date.timezone=America/Fortaleza`. |
| Os dados não são salvos (Apache no Linux ou macOS) | O usuário do Apache não pode escrever em `app/backend/` | Dê permissão de escrita na pasta `app/backend/` a esse usuário. |
 
> **Uso local apenas.** O servidor embutido do PHP serve para estudo e testes. A API não tem login e aceita requisições de qualquer origem, então não publique este projeto na internet sem antes proteger a API.
 
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
```
 