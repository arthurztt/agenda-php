document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'backend/api.php';

    let notesState = [];

    // Elementos do DOM
    const notesGrid = document.getElementById('notesGrid');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const filterCategory = document.getElementById('filterCategory');
    const filterStatus = document.getElementById('filterStatus');

    // Estatísticas
    const statTotal = document.getElementById('statTotal');
    const statCompleted = document.getElementById('statCompleted');
    const statPending = document.getElementById('statPending');
    const statOverdue = document.getElementById('statOverdue');

    // Modal
    const noteModal = document.getElementById('noteModal');
    const noteForm = document.getElementById('noteForm');
    const modalTitle = document.getElementById('modalTitle');
    const btnOpenModal = document.getElementById('btnOpenModal');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnCancelModal = document.getElementById('btnCancelModal');

    // Campos do Formulário
    const noteIdInput = document.getElementById('noteId');
    const noteTitleInput = document.getElementById('noteTitle');
    const noteDescriptionInput = document.getElementById('noteDescription');
    const noteCategoryInput = document.getElementById('noteCategory');
    const noteStatusInput = document.getElementById('noteStatus');
    const noteDatetimeInput = document.getElementById('noteDatetime');

    // Mapeamento de Ícones por Categoria
    const categoryIcons = {
        'Atividade': 'fa-person-running',
        'Evento': 'fa-calendar-day',
        'Reunião': 'fa-handshake',
        'Tarefa': 'fa-list-check'
    };

    const categoryClasses = {
        'Atividade': 'category-atividade',
        'Evento': 'category-evento',
        'Reunião': 'category-reuniao',
        'Tarefa': 'category-tarefa'
    };

    const statusClasses = {
        'Concluída': 'status-concluida',
        'Pendente': 'status-pendente',
        'Atrasada': 'status-atrasada'
    };

    // Carregar Anotações ao iniciar
    loadNotes();

    // Eventos do Modal
    btnOpenModal.addEventListener('click', () => openModal());
    btnCloseModal.addEventListener('click', closeModal);
    btnCancelModal.addEventListener('click', closeModal);
    noteModal.addEventListener('click', (e) => {
        if (e.target === noteModal) closeModal();
    });

    // Eventos dos Filtros e Formulário
    noteForm.addEventListener('submit', handleFormSubmit);
    searchInput.addEventListener('input', renderNotes);
    filterCategory.addEventListener('change', renderNotes);
    filterStatus.addEventListener('change', renderNotes);

    // Buscar anotações no PHP
    async function loadNotes() {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            if (data.success) {
                notesState = data.data;
                updateStats();
                renderNotes();
            } else {
                showToast(data.message || 'Erro ao carregar dados', 'error');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            showToast('Erro de conexão com o servidor PHP', 'error');
        }
    }

    // Renderizar Cards com Filtros
    function renderNotes() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedCategory = filterCategory.value;
        const selectedStatus = filterStatus.value;

        const filtered = notesState.filter(note => {
            const matchesSearch = note.title.toLowerCase().includes(searchTerm) ||
                                  (note.description && note.description.toLowerCase().includes(searchTerm));
            const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
            const matchesStatus = selectedStatus === 'all' || note.status === selectedStatus;

            return matchesSearch && matchesCategory && matchesStatus;
        });

        notesGrid.innerHTML = '';

        if (filtered.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            filtered.forEach(note => {
                const card = createNoteCard(note);
                notesGrid.appendChild(card);
            });
        }
    }

    // Criar Elemento Card
    function createNoteCard(note) {
        const card = document.createElement('div');
        card.className = `note-card bg-slate-800/90 border border-slate-700 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-slate-600`;

        const categoryClass = categoryClasses[note.category] || 'category-tarefa';
        const categoryIcon = categoryIcons[note.category] || 'fa-list-check';
        const statusClass = statusClasses[note.status] || 'status-pendente';

        const formattedDate = note.datetime
            ? new Date(note.datetime).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
            : 'Sem prazo determinado';

        const isCompleted = note.status === 'Concluída';

        card.innerHTML = `
            <div class="space-y-3">
                <div class="flex items-center justify-between flex-wrap gap-2">
                    <span class="px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 ${categoryClass}">
                        <i class="fa-solid ${categoryIcon}"></i>
                        ${escapeHtml(note.category)}
                    </span>
                    <span class="px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 ${statusClass}">
                        <i class="fa-solid ${isCompleted ? 'fa-check' : (note.status === 'Atrasada' ? 'fa-triangle-exclamation' : 'fa-clock')}"></i>
                        ${escapeHtml(note.status)}
                    </span>
                </div>

                <div>
                    <h4 class="text-base font-bold text-slate-100 ${isCompleted ? 'line-through text-slate-400' : ''}">
                        ${escapeHtml(note.title)}
                    </h4>
                    ${note.description ? `<p class="text-xs text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">${escapeHtml(note.description)}</p>` : ''}
                </div>
            </div>

            <div class="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                <div class="flex items-center space-x-1.5">
                    <i class="fa-regular fa-calendar"></i>
                    <span>${formattedDate}</span>
                </div>

                <div class="flex items-center space-x-2">
                    <button class="toggle-status-btn p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors" title="Alternar status">
                        <i class="fa-solid ${isCompleted ? 'fa-rotate-left' : 'fa-check'}"></i>
                    </button>
                    <button class="edit-btn p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-indigo-400 transition-colors" title="Editar">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="delete-btn p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-rose-400 transition-colors" title="Excluir">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;

        card.querySelector('.toggle-status-btn').addEventListener('click', () => toggleNoteStatus(note));
        card.querySelector('.edit-btn').addEventListener('click', () => openModal(note));
        card.querySelector('.delete-btn').addEventListener('click', () => deleteNote(note.id));

        return card;
    }

    // Alternar Rápidamente o Status
    async function toggleNoteStatus(note) {
        const newStatus = note.status === 'Concluída' ? 'Pendente' : 'Concluída';
        try {
            const res = await fetch(API_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: note.id, status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                showToast(`Status alterado para "${newStatus}"`, 'success');
                loadNotes();
            } else {
                showToast(data.message || 'Erro ao alterar status', 'error');
            }
        } catch (error) {
            showToast('Erro ao se conectar com o servidor', 'error');
        }
    }

    // Modal
    function openModal(note = null) {
        noteForm.reset();
        if (note) {
            modalTitle.textContent = 'Editar Anotação';
            noteIdInput.value = note.id;
            noteTitleInput.value = note.title;
            noteDescriptionInput.value = note.description || '';
            noteCategoryInput.value = note.category;
            noteStatusInput.value = note.status;
            noteDatetimeInput.value = note.datetime || '';
        } else {
            modalTitle.textContent = 'Nova Anotação';
            noteIdInput.value = '';
            noteCategoryInput.value = 'Tarefa';
            noteStatusInput.value = 'Pendente';
        }
        noteModal.classList.remove('hidden');
    }

    function closeModal() {
        noteModal.classList.add('hidden');
        noteForm.reset();
    }

    // Salvar (Criar ou Editar)
    async function handleFormSubmit(e) {
        e.preventDefault();

        const id = noteIdInput.value;
        const noteData = {
            title: noteTitleInput.value.trim(),
            description: noteDescriptionInput.value.trim(),
            category: noteCategoryInput.value,
            status: noteStatusInput.value,
            datetime: noteDatetimeInput.value
        };

        const isEdit = Boolean(id);
        const method = isEdit ? 'PUT' : 'POST';
        if (isEdit) noteData.id = id;

        try {
            const res = await fetch(API_URL, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(noteData)
            });

            const data = await res.json();
            if (data.success) {
                showToast(isEdit ? 'Anotação atualizada!' : 'Anotação criada!', 'success');
                closeModal();
                loadNotes();
            } else {
                showToast(data.message || 'Erro ao salvar anotação', 'error');
            }
        } catch (error) {
            showToast('Erro ao se comunicar com o servidor PHP', 'error');
        }
    }

    // Excluir
    async function deleteNote(id) {
        if (!confirm('Tem certeza que deseja excluir esta anotação?')) return;

        try {
            const res = await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                showToast('Anotação excluída com sucesso!', 'success');
                loadNotes();
            } else {
                showToast(data.message || 'Erro ao excluir anotação', 'error');
            }
        } catch (error) {
            showToast('Erro ao se comunicar com o servidor', 'error');
        }
    }

    // Atualizar Estatísticas
    function updateStats() {
        statTotal.textContent = notesState.length;
        statCompleted.textContent = notesState.filter(n => n.status === 'Concluída').length;
        statPending.textContent = notesState.filter(n => n.status === 'Pendente').length;
        statOverdue.textContent = notesState.filter(n => n.status === 'Atrasada').length;
    }

    // Notificação Toast
    function showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');

        const bgColors = {
            'success': 'bg-emerald-600',
            'error': 'bg-rose-600',
            'info': 'bg-indigo-600'
        };

        const icons = {
            'success': 'fa-circle-check',
            'error': 'fa-circle-xmark',
            'info': 'fa-circle-info'
        };

        toast.className = `${bgColors[type] || bgColors.info} text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-3 text-sm font-medium transition-all duration-300 transform translate-y-2 opacity-0`;
        toast.innerHTML = `
            <i class="fa-solid ${icons[type]} text-base"></i>
            <span>${escapeHtml(message)}</span>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-2');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function escapeHtml(str) {
        return (str || '').replace(/[&<>"']/g, function(m) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[m];
        });
    }
});
