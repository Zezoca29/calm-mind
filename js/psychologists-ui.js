/**
 * Psychologists UI - Interface de Gerenciamento de Psicólogos
 * Calm Mind App - Funções de UI e integração com DOM
 */

// ============= VARIÁVEIS GLOBAIS =============

let currentEditingId = null;
let currentFilters = {};

// ============= INICIALIZAÇÃO =============

async function initPsychologistsUI() {
    try {
        // Inicializa o manager
        const initialized = await window.psychologistsManager.init();

        if (!initialized) {
            console.error('Erro ao inicializar gerenciador de psicólogos');
            return;
        }

        // Preenche selects
        populateFilters();
        populateFormSelects();

        // Carrega e renderiza psicólogos
        await loadAndRenderPsychologists();

        // Event listeners
        attachEventListeners();

        console.log('UI de psicólogos inicializada com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar UI de psicólogos:', error);
        showError('Erro ao carregar psicólogos');
    }
}

// ============= RENDERIZAÇÃO =============

async function loadAndRenderPsychologists(filters = {}) {
    try {
        const psychologists = await window.psychologistsManager.loadPsychologists(filters);
        renderPsychologistsList(psychologists);
    } catch (error) {
        console.error('Erro ao carregar psicólogos:', error);
        showPsychologistsError('Erro ao carregar psicólogos');
    }
}

function renderPsychologistsList(psychologists) {
    const container = document.getElementById('psychologistsList');
    if (!container) return;

    if (!psychologists || psychologists.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12 text-gray-500">
                <p class="text-4xl mb-2">🔍</p>
                <p class="text-lg font-medium">Nenhum psicólogo encontrado</p>
                <p class="text-sm mt-1">Cadastre o primeiro psicólogo ou ajuste os filtros</p>
            </div>
        `;
        return;
    }

    const cardsHTML = psychologists.map(p => createPsychologistCard(p)).join('');
    container.innerHTML = cardsHTML;
}

function createPsychologistCard(psychologist) {
    const {
        id,
        name,
        crp,
        specialty = [],
        bio,
        phone,
        email,
        address_city,
        address_state,
        accepts_online,
        accepts_in_person,
        price_range,
        photo_url,
        rating
    } = psychologist;

    const specialtiesHTML = specialty.slice(0, 3).map(s =>
        `<span class="inline-block bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full">${s}</span>`
    ).join(' ');

    const moreSpecialties = specialty.length > 3 ? `<span class="text-xs text-gray-500">+${specialty.length - 3}</span>` : '';

    const starsHTML = window.psychologistsManager.generateStarsHTML(rating);

    const photoHTML = photo_url
        ? `<img src="${photo_url}" alt="${name}" class="w-full h-48 object-cover">`
        : `<div class="w-full h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
               <span class="text-6xl text-white">👨‍⚕️</span>
           </div>`;

    const location = [address_city, address_state].filter(Boolean).join(' - ');

    return `
        <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200">
            ${photoHTML}

            <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-1">${name}</h3>
                <p class="text-xs text-gray-500 mb-2">CRP: ${crp}</p>

                ${rating ? `<div class="mb-2">${starsHTML}</div>` : ''}

                ${bio ? `<p class="text-sm text-gray-600 mb-3 line-clamp-2">${bio}</p>` : ''}

                ${specialty.length > 0 ? `
                    <div class="mb-3 flex flex-wrap gap-1">
                        ${specialtiesHTML}
                        ${moreSpecialties}
                    </div>
                ` : ''}

                <div class="text-sm text-gray-600 space-y-1 mb-3">
                    ${location ? `<p class="flex items-center gap-1">📍 ${location}</p>` : ''}
                    ${phone ? `<p class="flex items-center gap-1">📞 ${window.psychologistsManager.formatPhone(phone)}</p>` : ''}
                    ${email ? `<p class="flex items-center gap-1">📧 ${email}</p>` : ''}
                    ${price_range ? `<p class="flex items-center gap-1">💰 ${price_range}</p>` : ''}
                </div>

                <div class="flex gap-2 mb-3 text-xs">
                    ${accepts_online ? '<span class="bg-green-100 text-green-700 px-2 py-1 rounded">💻 Online</span>' : ''}
                    ${accepts_in_person ? '<span class="bg-blue-100 text-blue-700 px-2 py-1 rounded">🏢 Presencial</span>' : ''}
                </div>

                <div class="flex gap-2">
                    <button onclick="viewPsychologist('${id}')" class="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm py-2 rounded-lg transition-colors">
                        Ver Detalhes
                    </button>
                    ${phone ? `
                        <a href="tel:${phone}" class="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-1">
                            📞
                        </a>
                    ` : ''}
                    ${email ? `
                        <a href="mailto:${email}" class="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-1">
                            📧
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// ============= MODAL DE CADASTRO/EDIÇÃO =============

function openPsychologistModal(psychologistId = null) {
    const modal = document.getElementById('psychologistModal');
    const form = document.getElementById('psychologistForm');
    const title = document.getElementById('modalTitle');

    if (!modal || !form) return;

    // Limpa o formulário
    form.reset();
    document.getElementById('formErrors').classList.add('hidden');
    currentEditingId = psychologistId;

    if (psychologistId) {
        // Modo edição
        title.textContent = 'Editar Psicólogo';
        loadPsychologistToForm(psychologistId);
    } else {
        // Modo cadastro
        title.textContent = 'Cadastrar Psicólogo';
    }

    modal.classList.remove('hidden');
}

async function loadPsychologistToForm(id) {
    try {
        const psychologist = await window.psychologistsManager.getPsychologistById(id);

        if (!psychologist) {
            showError('Psicólogo não encontrado');
            closePsychologistModal();
            return;
        }

        // Preenche formulário
        document.getElementById('psychName').value = psychologist.name || '';
        document.getElementById('psychCRP').value = psychologist.crp || '';
        document.getElementById('psychBio').value = psychologist.bio || '';
        document.getElementById('psychPhone').value = psychologist.phone || '';
        document.getElementById('psychEmail').value = psychologist.email || '';
        document.getElementById('psychWebsite').value = psychologist.website || '';

        // Endereço
        document.getElementById('psychZipcode').value = psychologist.address_zipcode ? window.psychologistsManager.formatCEP(psychologist.address_zipcode) : '';
        document.getElementById('psychStreet').value = psychologist.address_street || '';
        document.getElementById('psychNumber').value = psychologist.address_number || '';
        document.getElementById('psychComplement').value = psychologist.address_complement || '';
        document.getElementById('psychNeighborhood').value = psychologist.address_neighborhood || '';
        document.getElementById('psychCity').value = psychologist.address_city || '';
        document.getElementById('psychState').value = psychologist.address_state || '';

        // Especialidades (select múltiplo)
        if (psychologist.specialty && psychologist.specialty.length > 0) {
            const select = document.getElementById('psychSpecialty');
            Array.from(select.options).forEach(option => {
                option.selected = psychologist.specialty.includes(option.value);
            });
        }

        // Atendimento
        document.getElementById('psychAcceptsOnline').checked = psychologist.accepts_online || false;
        document.getElementById('psychAcceptsInPerson').checked = psychologist.accepts_in_person !== false;
        document.getElementById('psychPriceRange').value = psychologist.price_range || '';

        if (psychologist.insurance_plans && psychologist.insurance_plans.length > 0) {
            document.getElementById('psychInsurance').value = psychologist.insurance_plans.join(', ');
        }

        // Mídia
        document.getElementById('psychPhotoUrl').value = psychologist.photo_url || '';
        document.getElementById('psychIsActive').checked = psychologist.is_active !== false;

    } catch (error) {
        console.error('Erro ao carregar psicólogo:', error);
        showError('Erro ao carregar dados do psicólogo');
    }
}

function closePsychologistModal() {
    const modal = document.getElementById('psychologistModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    currentEditingId = null;
}

async function savePsychologist(event) {
    event.preventDefault();

    const formErrors = document.getElementById('formErrors');
    formErrors.classList.add('hidden');

    try {
        // Coleta dados do formulário
        const specialty = Array.from(document.getElementById('psychSpecialty').selectedOptions).map(o => o.value);
        const insurance = document.getElementById('psychInsurance').value.split(',').map(s => s.trim()).filter(Boolean);

        const psychologistData = {
            name: document.getElementById('psychName').value.trim(),
            crp: document.getElementById('psychCRP').value.trim(),
            specialty: specialty,
            bio: document.getElementById('psychBio').value.trim() || null,
            phone: document.getElementById('psychPhone').value.trim() || null,
            email: document.getElementById('psychEmail').value.trim() || null,
            website: document.getElementById('psychWebsite').value.trim() || null,
            address_street: document.getElementById('psychStreet').value.trim() || null,
            address_number: document.getElementById('psychNumber').value.trim() || null,
            address_complement: document.getElementById('psychComplement').value.trim() || null,
            address_neighborhood: document.getElementById('psychNeighborhood').value.trim() || null,
            address_city: document.getElementById('psychCity').value.trim() || null,
            address_state: document.getElementById('psychState').value || null,
            address_zipcode: document.getElementById('psychZipcode').value.replace(/\D/g, '') || null,
            accepts_online: document.getElementById('psychAcceptsOnline').checked,
            accepts_in_person: document.getElementById('psychAcceptsInPerson').checked,
            insurance_plans: insurance,
            price_range: document.getElementById('psychPriceRange').value.trim() || null,
            photo_url: document.getElementById('psychPhotoUrl').value.trim() || null,
            is_active: document.getElementById('psychIsActive').checked
        };

        // Valida
        const validation = window.psychologistsManager.validatePsychologist(psychologistData);
        if (!validation.isValid) {
            formErrors.textContent = validation.errors.join('; ');
            formErrors.classList.remove('hidden');
            return;
        }

        // Salva
        if (currentEditingId) {
            await window.psychologistsManager.updatePsychologist(currentEditingId, psychologistData);
            showSuccess('Psicólogo atualizado com sucesso!');
        } else {
            await window.psychologistsManager.createPsychologist(psychologistData);
            showSuccess('Psicólogo cadastrado com sucesso!');
        }

        closePsychologistModal();
        await loadAndRenderPsychologists(currentFilters);

    } catch (error) {
        console.error('Erro ao salvar psicólogo:', error);
        formErrors.textContent = error.message || 'Erro ao salvar psicólogo';
        formErrors.classList.remove('hidden');
    }
}

// ============= AÇÕES =============

async function viewPsychologist(id) {
    try {
        const psychologist = await window.psychologistsManager.getPsychologistById(id);
        if (!psychologist) return;

        const modalHTML = createViewModal(psychologist);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHTML;
        document.body.appendChild(tempDiv.firstElementChild);
    } catch (error) {
        console.error('Erro ao visualizar psicólogo:', error);
        showError('Erro ao carregar detalhes');
    }
}

function createViewModal(p) {
    const specialties = (p.specialty || []).map(s =>
        `<span class="inline-block bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full">${s}</span>`
    ).join(' ');

    const insurance = (p.insurance_plans || []).map(i =>
        `<span class="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">${i}</span>`
    ).join(' ');

    return `
        <div id="viewModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h3 class="text-xl font-semibold text-primary-700">${p.name}</h3>
                    <button onclick="closeViewModal()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>

                <div class="p-6">
                    ${p.photo_url ? `<img src="${p.photo_url}" alt="${p.name}" class="w-full h-64 object-cover rounded-lg mb-4">` : ''}

                    <div class="space-y-4">
                        <div>
                            <h4 class="font-semibold text-gray-700 mb-1">CRP</h4>
                            <p class="text-gray-600">${p.crp}</p>
                        </div>

                        ${p.bio ? `
                            <div>
                                <h4 class="font-semibold text-gray-700 mb-1">Sobre</h4>
                                <p class="text-gray-600">${p.bio}</p>
                            </div>
                        ` : ''}

                        ${p.specialty && p.specialty.length > 0 ? `
                            <div>
                                <h4 class="font-semibold text-gray-700 mb-2">Especialidades</h4>
                                <div class="flex flex-wrap gap-2">${specialties}</div>
                            </div>
                        ` : ''}

                        <div>
                            <h4 class="font-semibold text-gray-700 mb-1">Contato</h4>
                            ${p.phone ? `<p class="text-gray-600">📞 ${window.psychologistsManager.formatPhone(p.phone)}</p>` : ''}
                            ${p.email ? `<p class="text-gray-600">📧 ${p.email}</p>` : ''}
                            ${p.website ? `<p class="text-gray-600">🌐 <a href="${p.website}" target="_blank" class="text-primary-600 hover:underline">${p.website}</a></p>` : ''}
                        </div>

                        ${p.address_city || p.address_state ? `
                            <div>
                                <h4 class="font-semibold text-gray-700 mb-1">Endereço</h4>
                                <p class="text-gray-600">
                                    ${[p.address_street, p.address_number].filter(Boolean).join(', ')}<br>
                                    ${[p.address_neighborhood, p.address_city, p.address_state].filter(Boolean).join(' - ')}<br>
                                    ${p.address_zipcode ? `CEP: ${window.psychologistsManager.formatCEP(p.address_zipcode)}` : ''}
                                </p>
                            </div>
                        ` : ''}

                        <div>
                            <h4 class="font-semibold text-gray-700 mb-1">Atendimento</h4>
                            <div class="flex gap-2 mb-2">
                                ${p.accepts_online ? '<span class="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">💻 Online</span>' : ''}
                                ${p.accepts_in_person ? '<span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">🏢 Presencial</span>' : ''}
                            </div>
                            ${p.price_range ? `<p class="text-gray-600">Faixa de preço: ${p.price_range}</p>` : ''}
                        </div>

                        ${p.insurance_plans && p.insurance_plans.length > 0 ? `
                            <div>
                                <h4 class="font-semibold text-gray-700 mb-2">Planos Aceitos</h4>
                                <div class="flex flex-wrap gap-2">${insurance}</div>
                            </div>
                        ` : ''}

                        ${p.rating ? `
                            <div>
                                <h4 class="font-semibold text-gray-700 mb-1">Avaliação</h4>
                                <div>${window.psychologistsManager.generateStarsHTML(p.rating)}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="border-t border-gray-200 p-4 flex gap-2">
                    ${p.phone ? `
                        <a href="tel:${p.phone}" class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-center">
                            📞 Ligar
                        </a>
                    ` : ''}
                    ${p.email ? `
                        <a href="mailto:${p.email}" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-center">
                            📧 Enviar E-mail
                        </a>
                    ` : ''}
                    ${p.website ? `
                        <a href="${p.website}" target="_blank" class="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg text-center">
                            🌐 Site
                        </a>
                    ` : ''}
                    <button onclick="closeViewModal()" class="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    `;
}

function closeViewModal() {
    const modal = document.getElementById('viewModal');
    if (modal) {
        modal.remove();
    }
}

async function editPsychologist(id) {
    openPsychologistModal(id);
}

async function deletePsychologist(id) {
    if (!confirm('Tem certeza que deseja excluir este psicólogo?')) {
        return;
    }

    try {
        await window.psychologistsManager.deactivatePsychologist(id);
        showSuccess('Psicólogo removido com sucesso!');
        await loadAndRenderPsychologists(currentFilters);
    } catch (error) {
        console.error('Erro ao deletar psicólogo:', error);
        showError('Erro ao remover psicólogo');
    }
}

// ============= FILTROS E BUSCA =============

async function applyFilters() {
    const filters = {
        search: document.getElementById('searchPsychologist').value.trim(),
        state: document.getElementById('filterState').value,
        specialty: document.getElementById('filterSpecialty').value,
        acceptsOnline: document.getElementById('filterOnline').checked ? true : undefined
    };

    currentFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '' && v !== undefined)
    );

    await loadAndRenderPsychologists(currentFilters);
}

function clearFilters() {
    document.getElementById('searchPsychologist').value = '';
    document.getElementById('filterState').value = '';
    document.getElementById('filterSpecialty').value = '';
    document.getElementById('filterOnline').checked = false;

    currentFilters = {};
    loadAndRenderPsychologists();
}

// ============= CEP =============

async function searchCEP() {
    const cepInput = document.getElementById('psychZipcode');
    const cep = cepInput.value;

    if (!cep) {
        alert('Digite um CEP válido');
        return;
    }

    try {
        const address = await window.psychologistsManager.searchCEP(cep);

        document.getElementById('psychStreet').value = address.street;
        document.getElementById('psychNeighborhood').value = address.neighborhood;
        document.getElementById('psychCity').value = address.city;
        document.getElementById('psychState').value = address.state;

        cepInput.value = window.psychologistsManager.formatCEP(address.zipcode);

        showSuccess('CEP encontrado!');
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        showError(error.message || 'CEP não encontrado');
    }
}

// ============= EXPORT =============

function exportPsychologists() {
    try {
        window.psychologistsManager.exportToCSV();
        showSuccess('Lista exportada com sucesso!');
    } catch (error) {
        console.error('Erro ao exportar:', error);
        showError('Erro ao exportar lista');
    }
}

// ============= UTILITÁRIOS UI =============

function populateFilters() {
    // Estados
    const stateSelect = document.getElementById('filterState');
    if (stateSelect) {
        PsychologistsConfig.estados.forEach(estado => {
            const option = document.createElement('option');
            option.value = estado;
            option.textContent = estado;
            stateSelect.appendChild(option);
        });
    }

    // Especialidades
    const specialtySelect = document.getElementById('filterSpecialty');
    if (specialtySelect) {
        PsychologistsConfig.especialidades.forEach(esp => {
            const option = document.createElement('option');
            option.value = esp;
            option.textContent = esp;
            specialtySelect.appendChild(option);
        });
    }
}

function populateFormSelects() {
    // Estados no formulário
    const stateSelect = document.getElementById('psychState');
    if (stateSelect) {
        PsychologistsConfig.estados.forEach(estado => {
            const option = document.createElement('option');
            option.value = estado;
            option.textContent = estado;
            stateSelect.appendChild(option);
        });
    }

    // Especialidades no formulário
    const specialtySelect = document.getElementById('psychSpecialty');
    if (specialtySelect) {
        PsychologistsConfig.especialidades.forEach(esp => {
            const option = document.createElement('option');
            option.value = esp;
            option.textContent = esp;
            specialtySelect.appendChild(option);
        });
    }
}

function attachEventListeners() {
    // Form submit
    const form = document.getElementById('psychologistForm');
    if (form) {
        form.addEventListener('submit', savePsychologist);
    }

    // Busca em tempo real
    const searchInput = document.getElementById('searchPsychologist');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => applyFilters(), 500);
        });
    }

    // Máscara de telefone
    const phoneInput = document.getElementById('psychPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);

            if (value.length > 6) {
                value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
            } else if (value.length > 2) {
                value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
            }

            e.target.value = value;
        });
    }

    // Máscara de CEP
    const cepInput = document.getElementById('psychZipcode');
    if (cepInput) {
        cepInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 8) value = value.slice(0, 8);

            if (value.length > 5) {
                value = `${value.slice(0, 5)}-${value.slice(5)}`;
            }

            e.target.value = value;
        });
    }

    // Máscara de CRP
    const crpInput = document.getElementById('psychCRP');
    if (crpInput) {
        crpInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 7) value = value.slice(0, 7);

            if (value.length > 2) {
                value = `${value.slice(0, 2)}/${value.slice(2)}`;
            }

            e.target.value = value;
        });
    }
}

function showPsychologistsError(message) {
    const container = document.getElementById('psychologistsList');
    if (container) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-4xl mb-2">⚠️</p>
                <p class="text-red-600 font-medium">${message}</p>
                <button onclick="loadAndRenderPsychologists()" class="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg">
                    Tentar novamente
                </button>
            </div>
        `;
    }
}

function showSuccess(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.remove('translate-x-full');

        setTimeout(() => {
            toast.classList.add('translate-x-full');
        }, 3000);
    }
}

function showError(message) {
    alert(message); // Pode ser melhorado com toast
}

// ============= EXPORTAÇÃO GLOBAL =============

window.initPsychologistsUI = initPsychologistsUI;
window.openPsychologistModal = openPsychologistModal;
window.closePsychologistModal = closePsychologistModal;
window.viewPsychologist = viewPsychologist;
window.closeViewModal = closeViewModal;
window.editPsychologist = editPsychologist;
window.deletePsychologist = deletePsychologist;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.searchCEP = searchCEP;
window.exportPsychologists = exportPsychologists;
window.loadAndRenderPsychologists = loadAndRenderPsychologists;
