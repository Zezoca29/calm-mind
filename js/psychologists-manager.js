/**
 * Psychologists Manager - Gerenciamento de Psicólogos
 * Calm Mind App - Sistema CRUD completo integrado com Supabase
 */

// ============= CONFIGURAÇÕES =============

const PsychologistsConfig = {
    tableName: 'psychologists',
    estados: ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'],
    especialidades: [
        'Ansiedade',
        'Depressão',
        'TCC (Terapia Cognitivo-Comportamental)',
        'Psicanálise',
        'Gestalt-terapia',
        'Terapia de Casal',
        'Terapia Familiar',
        'Neuropsicologia',
        'Psicologia Infantil',
        'Psicologia do Adolescente',
        'EMDR',
        'ACT (Terapia de Aceitação e Compromisso)',
        'DBT (Terapia Comportamental Dialética)',
        'Luto',
        'Transtornos Alimentares',
        'Dependência Química',
        'TDAH',
        'Autismo (TEA)',
        'Trauma',
        'Sexualidade'
    ]
};

// ============= CLASSE PRINCIPAL =============

class PsychologistsManager {
    constructor() {
        this.psychologists = [];
        this.currentPsychologist = null;
        this.isEditMode = false;
        this.currentUserId = null;
        this.supabase = null;
    }

    // ============= INICIALIZAÇÃO =============

    async init() {
        // Verifica se a função getSupabaseClient está disponível
        if (typeof window.getSupabaseClient !== 'function') {
            console.error('getSupabaseClient não está disponível');
            return false;
        }

        this.supabase = window.getSupabaseClient();

        if (!this.supabase) {
            console.error('Não foi possível obter o cliente Supabase');
            return false;
        }

        // Pega o ID do usuário atual
        if (typeof window.getCurrentUserId === 'function') {
            this.currentUserId = window.getCurrentUserId();
        }

        if (!this.currentUserId) {
            console.error('Usuário não autenticado');
            return false;
        }

        // Carrega psicólogos
        await this.loadPsychologists();

        return true;
    }

    // ============= OPERAÇÕES CRUD =============

    /**
     * Lista todos os psicólogos ativos
     */
    async loadPsychologists(filters = {}) {
        try {
            let query = this.supabase
                .from(PsychologistsConfig.tableName)
                .select('*')
                .eq('is_active', true)
                .order('name', { ascending: true });

            // Aplicar filtros
            if (filters.city) {
                query = query.ilike('address_city', `%${filters.city}%`);
            }
            if (filters.state) {
                query = query.eq('address_state', filters.state);
            }
            if (filters.specialty) {
                query = query.contains('specialty', [filters.specialty]);
            }
            if (filters.acceptsOnline !== undefined) {
                query = query.eq('accepts_online', filters.acceptsOnline);
            }
            if (filters.search) {
                query = query.or(`name.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`);
            }

            const { data, error } = await query;

            if (error) throw error;

            this.psychologists = data || [];
            return this.psychologists;
        } catch (error) {
            console.error('Erro ao carregar psicólogos:', error);
            throw error;
        }
    }

    /**
     * Busca um psicólogo por ID
     */
    async getPsychologistById(id) {
        try {
            const { data, error } = await this.supabase
                .from(PsychologistsConfig.tableName)
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Erro ao buscar psicólogo:', error);
            throw error;
        }
    }

    /**
     * Cria um novo psicólogo
     */
    async createPsychologist(psychologistData) {
        try {
            // Adiciona o ID do usuário que está cadastrando
            const dataToInsert = {
                ...psychologistData,
                added_by: this.currentUserId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from(PsychologistsConfig.tableName)
                .insert([dataToInsert])
                .select()
                .single();

            if (error) throw error;

            // Atualiza a lista local
            this.psychologists.push(data);

            return data;
        } catch (error) {
            console.error('Erro ao criar psicólogo:', error);
            throw error;
        }
    }

    /**
     * Atualiza um psicólogo existente
     */
    async updatePsychologist(id, psychologistData) {
        try {
            const dataToUpdate = {
                ...psychologistData,
                updated_at: new Date().toISOString()
            };

            // Remove campos que não devem ser atualizados
            delete dataToUpdate.id;
            delete dataToUpdate.added_by;
            delete dataToUpdate.created_at;

            const { data, error } = await this.supabase
                .from(PsychologistsConfig.tableName)
                .update(dataToUpdate)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // Atualiza a lista local
            const index = this.psychologists.findIndex(p => p.id === id);
            if (index !== -1) {
                this.psychologists[index] = data;
            }

            return data;
        } catch (error) {
            console.error('Erro ao atualizar psicólogo:', error);
            throw error;
        }
    }

    /**
     * Desativa um psicólogo (soft delete)
     */
    async deactivatePsychologist(id) {
        try {
            const { data, error } = await this.supabase
                .from(PsychologistsConfig.tableName)
                .update({ is_active: false, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // Remove da lista local
            this.psychologists = this.psychologists.filter(p => p.id !== id);

            return data;
        } catch (error) {
            console.error('Erro ao desativar psicólogo:', error);
            throw error;
        }
    }

    /**
     * Deleta permanentemente um psicólogo (hard delete)
     */
    async deletePsychologist(id) {
        try {
            const { error } = await this.supabase
                .from(PsychologistsConfig.tableName)
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Remove da lista local
            this.psychologists = this.psychologists.filter(p => p.id !== id);

            return true;
        } catch (error) {
            console.error('Erro ao deletar psicólogo:', error);
            throw error;
        }
    }

    // ============= VALIDAÇÃO =============

    /**
     * Valida os dados do psicólogo
     */
    validatePsychologist(data) {
        const errors = [];

        if (!data.name || data.name.trim().length < 3) {
            errors.push('Nome deve ter pelo menos 3 caracteres');
        }

        if (!data.crp || !this.validateCRP(data.crp)) {
            errors.push('CRP inválido (formato: 00/00000)');
        }

        if (data.email && !this.validateEmail(data.email)) {
            errors.push('E-mail inválido');
        }

        if (data.phone && !this.validatePhone(data.phone)) {
            errors.push('Telefone inválido');
        }

        if (data.rating !== undefined && data.rating !== null) {
            const rating = parseFloat(data.rating);
            if (isNaN(rating) || rating < 0 || rating > 5) {
                errors.push('Avaliação deve estar entre 0 e 5');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valida CRP (formato: 00/00000)
     */
    validateCRP(crp) {
        const crpRegex = /^\d{2}\/\d{5}$/;
        return crpRegex.test(crp);
    }

    /**
     * Valida e-mail
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Valida telefone
     */
    validatePhone(phone) {
        // Remove caracteres não numéricos
        const cleaned = phone.replace(/\D/g, '');
        // Aceita 10 ou 11 dígitos (com ou sem nono dígito)
        return cleaned.length === 10 || cleaned.length === 11;
    }

    // ============= UTILITÁRIOS =============

    /**
     * Formata telefone
     */
    formatPhone(phone) {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');

        if (cleaned.length === 11) {
            return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
        } else if (cleaned.length === 10) {
            return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
        }

        return phone;
    }

    /**
     * Formata CEP
     */
    formatCEP(cep) {
        if (!cep) return '';
        const cleaned = cep.replace(/\D/g, '');

        if (cleaned.length === 8) {
            return `${cleaned.substring(0, 5)}-${cleaned.substring(5)}`;
        }

        return cep;
    }

    /**
     * Busca endereço por CEP usando API ViaCEP
     */
    async searchCEP(cep) {
        try {
            const cleaned = cep.replace(/\D/g, '');

            if (cleaned.length !== 8) {
                throw new Error('CEP deve ter 8 dígitos');
            }

            const response = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
            const data = await response.json();

            if (data.erro) {
                throw new Error('CEP não encontrado');
            }

            return {
                street: data.logradouro || '',
                neighborhood: data.bairro || '',
                city: data.localidade || '',
                state: data.uf || '',
                zipcode: cleaned
            };
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            throw error;
        }
    }

    /**
     * Gera estrelas de avaliação (HTML)
     */
    generateStarsHTML(rating) {
        if (!rating) return '<span class="text-gray-400">Sem avaliações</span>';

        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let html = '';

        for (let i = 0; i < fullStars; i++) {
            html += '<span class="text-yellow-400">★</span>';
        }

        if (hasHalfStar) {
            html += '<span class="text-yellow-400">⯨</span>';
        }

        for (let i = 0; i < emptyStars; i++) {
            html += '<span class="text-gray-300">☆</span>';
        }

        html += `<span class="text-sm text-gray-600 ml-2">${rating.toFixed(1)}</span>`;

        return html;
    }

    /**
     * Filtra psicólogos localmente (cache)
     */
    filterPsychologists(filters) {
        let filtered = [...this.psychologists];

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchLower) ||
                (p.bio && p.bio.toLowerCase().includes(searchLower)) ||
                (p.address_city && p.address_city.toLowerCase().includes(searchLower))
            );
        }

        if (filters.city) {
            filtered = filtered.filter(p =>
                p.address_city && p.address_city.toLowerCase().includes(filters.city.toLowerCase())
            );
        }

        if (filters.state) {
            filtered = filtered.filter(p => p.address_state === filters.state);
        }

        if (filters.specialty) {
            filtered = filtered.filter(p =>
                p.specialty && p.specialty.includes(filters.specialty)
            );
        }

        if (filters.acceptsOnline !== undefined) {
            filtered = filtered.filter(p => p.accepts_online === filters.acceptsOnline);
        }

        return filtered;
    }

    /**
     * Ordena psicólogos
     */
    sortPsychologists(psychologists, sortBy = 'name', order = 'asc') {
        const sorted = [...psychologists];

        sorted.sort((a, b) => {
            let valueA, valueB;

            switch (sortBy) {
                case 'name':
                    valueA = a.name.toLowerCase();
                    valueB = b.name.toLowerCase();
                    break;
                case 'rating':
                    valueA = a.rating || 0;
                    valueB = b.rating || 0;
                    break;
                case 'city':
                    valueA = (a.address_city || '').toLowerCase();
                    valueB = (b.address_city || '').toLowerCase();
                    break;
                default:
                    return 0;
            }

            if (valueA < valueB) return order === 'asc' ? -1 : 1;
            if (valueA > valueB) return order === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }

    /**
     * Exporta psicólogos para CSV
     */
    exportToCSV() {
        const headers = [
            'Nome',
            'CRP',
            'Especialidades',
            'Telefone',
            'E-mail',
            'Cidade',
            'Estado',
            'Atende Online',
            'Atende Presencial',
            'Avaliação'
        ];

        const rows = this.psychologists.map(p => [
            p.name,
            p.crp,
            (p.specialty || []).join('; '),
            p.phone || '',
            p.email || '',
            p.address_city || '',
            p.address_state || '',
            p.accepts_online ? 'Sim' : 'Não',
            p.accepts_in_person ? 'Sim' : 'Não',
            p.rating || '-'
        ]);

        const csv = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `psicologos_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// ============= INSTÂNCIA GLOBAL =============

window.PsychologistsManager = PsychologistsManager;
window.PsychologistsConfig = PsychologistsConfig;

// Cria instância global
window.psychologistsManager = new PsychologistsManager();
