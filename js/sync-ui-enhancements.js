// sync-ui-enhancements.js - Melhorias de UI para sincronização

// Abrir modal de configurações de sincronização
function openSyncSettings() {
    // Criar modal de configurações de sincronização
    const modal = document.createElement('div');
    modal.id = 'syncSettingsModal';
    modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-calm-card rounded-2xl p-6 max-w-md w-full border border-calm-blue/30 shadow-2xl">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-2xl font-bold">Configurações de Sincronização</h3>
                <button onclick="closeSyncSettings()" class="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>
            
            <div class="space-y-6">
                <div>
                    <h4 class="font-semibold mb-3">Frequência de Sincronização</h4>
                    <p class="text-xs text-gray-400 mb-3">Maior intervalo = melhor usabilidade. Dados sincronizam automaticamente ao salvar.</p>
                    <div class="space-y-2">
                        <label class="flex items-center gap-3">
                            <input type="radio" name="syncFrequency" value="manual" class="text-calm-blue">
                            <span>Somente manual</span>
                        </label>
                        <label class="flex items-center gap-3">
                            <input type="radio" name="syncFrequency" value="60min" class="text-calm-blue">
                            <span>A cada hora</span>
                        </label>
                        <label class="flex items-center gap-3">
                            <input type="radio" name="syncFrequency" value="120min" class="text-calm-blue" checked>
                            <span>A cada 2 horas (recomendado)</span>
                        </label>
                        <label class="flex items-center gap-3">
                            <input type="radio" name="syncFrequency" value="240min" class="text-calm-blue">
                            <span>A cada 4 horas</span>
                        </label>
                    </div>
                </div>
                
                <div>
                    <h4 class="font-semibold mb-3">Opções Avançadas</h4>
                    <label class="flex items-center gap-3 mb-3">
                        <input type="checkbox" id="syncOnStartup" class="rounded text-calm-blue" checked>
                        <span>Sincronizar ao iniciar o app</span>
                    </label>
                    <label class="flex items-center gap-3">
                        <input type="checkbox" id="syncOnDataChange" class="rounded text-calm-blue" checked>
                        <span>Sincronizar automaticamente ao salvar dados (com atraso inteligente)</span>
                    </label>
                </div>
                
                <div class="pt-4 border-t border-gray-700">
                    <button onclick="manualSync()" class="w-full bg-calm-blue hover:bg-calm-blue-dark text-white py-3 rounded-lg font-semibold transition-all">
                        Sincronizar Agora
                    </button>
                    <p class="text-center text-sm text-gray-400 mt-3">
                        Última sincronização: <span id="lastSyncDisplay">-</span>
                    </p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Carregar configurações salvas
    loadSyncSettings();
    
    // Atualizar exibição da última sincronização
    updateLastSyncDisplay();
}

// Fechar modal de configurações de sincronização
function closeSyncSettings() {
    const modal = document.getElementById('syncSettingsModal');
    if (modal) {
        modal.remove();
    }
}

// Carregar configurações de sincronização
function loadSyncSettings() {
    // Frequência de sincronização (padrão: 120min = 2 horas)
    const frequency = localStorage.getItem('syncFrequency') || '120min';
    const frequencyRadios = document.querySelectorAll('input[name="syncFrequency"]');
    frequencyRadios.forEach(radio => {
        radio.checked = radio.value === frequency;
    });
    
    // Opções avançadas
    const syncOnStartup = localStorage.getItem('syncOnStartup') !== 'false'; // padrão true
    const syncOnDataChange = localStorage.getItem('syncOnDataChange') !== 'false'; // padrão true
    
    document.getElementById('syncOnStartup').checked = syncOnStartup;
    document.getElementById('syncOnDataChange').checked = syncOnDataChange;
}

// Salvar configurações de sincronização
function saveSyncSettings() {
    // Frequência de sincronização
    const selectedFrequency = document.querySelector('input[name="syncFrequency"]:checked');
    if (selectedFrequency) {
        localStorage.setItem('syncFrequency', selectedFrequency.value);
    }
    
    // Opções avançadas
    localStorage.setItem('syncOnStartup', document.getElementById('syncOnStartup').checked);
    localStorage.setItem('syncOnDataChange', document.getElementById('syncOnDataChange').checked);
    
    // Reconfigurar sincronização automática se necessário
    reconfigureAutoSync();
}

// Reconfigurar sincronização automática com base nas configurações
function reconfigureAutoSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
    }
    
    const frequency = localStorage.getItem('syncFrequency') || '120min'; // Padrão: 2 horas
    let intervalMs;
    
    switch (frequency) {
        case 'manual':
            // Não configurar intervalo automático
            console.log('✅ Modo de sincronização: Manual');
            return;
        case '60min':
            intervalMs = 60 * 60 * 1000; // 1 hora
            break;
        case '120min':
            intervalMs = 120 * 60 * 1000; // 2 horas (novo padrão)
            break;
        case '240min':
            intervalMs = 240 * 60 * 1000; // 4 horas
            break;
        default:
            intervalMs = 120 * 60 * 1000; // 2 horas por padrão
    }
    
    // Usar requestIdleCallback se disponível para não impactar a usabilidade
    if ('requestIdleCallback' in window) {
        syncInterval = setInterval(() => {
            requestIdleCallback(() => {
                syncToSupabase().catch(err => console.log('Sincronização automática falhou:', err));
                syncFromSupabase().catch(err => console.log('Download automático falhou:', err));
            }, { timeout: 5000 });
        }, intervalMs);
    } else {
        syncInterval = setInterval(async () => {
            await syncToSupabase();
            await syncFromSupabase();
        }, intervalMs);
    }
    
    console.log(`✅ Sincronização automática reconfigurada: a cada ${intervalMs/1000/60} minutos`);
}

// Atualizar exibição da última sincronização
function updateLastSyncDisplay() {
    const lastSync = localStorage.getItem('last_sync');
    const display = document.getElementById('lastSyncDisplay');
    
    if (lastSync && display) {
        display.textContent = formatTimeAgo(new Date(lastSync));
    } else if (display) {
        display.textContent = 'Nunca';
    }
}

// Formatar tempo relativo (copiado do supabase-sync.js para independência)
function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours} horas atrás`;
    return `${diffDays} dias atrás`;
}

// Atualizar indicador de status de sincronização
function updateSyncStatusIndicator(status, message) {
    const indicator = document.getElementById('syncIndicator');
    const text = document.getElementById('syncText');
    
    if (indicator && text) {
        switch (status) {
            case 'online':
                indicator.textContent = '🟢';
                text.textContent = message || 'Online';
                break;
            case 'offline':
                indicator.textContent = '🔴';
                text.textContent = message || 'Offline';
                break;
            case 'syncing':
                indicator.textContent = '🔄';
                text.textContent = message || 'Sincronizando...';
                break;
            case 'synced':
                indicator.textContent = '🟢';
                text.textContent = message || 'Sincronizado';
                break;
            case 'error':
                indicator.textContent = '❌';
                text.textContent = message || 'Erro na sincronização';
                break;
        }
    }
}

// Event listeners para os elementos do modal
document.addEventListener('click', function(e) {
    // Fechar modal ao clicar no fundo
    if (e.target.id === 'syncSettingsModal') {
        closeSyncSettings();
    }
    
    // Salvar configurações quando mudar qualquer opção
    if (e.target.matches('input[name="syncFrequency"], #syncOnStartup, #syncOnDataChange')) {
        saveSyncSettings();
    }
});

// Função para mostrar o nome do usuário na saudação
function displayUserGreeting() {
    try {
        const session = JSON.parse(localStorage.getItem('calm_mind_session') || '{}');
        const userName = session?.user?.user_metadata?.full_name || 
                        session?.user?.email?.split('@')[0] || 
                        'Usuário';
        
        const greetingEl = document.getElementById('userGreeting');
        if (greetingEl) {
            const hour = new Date().getHours();
            let greeting = 'Olá';
            
            if (hour < 12) greeting = 'Bom dia';
            else if (hour < 18) greeting = 'Boa tarde';
            else greeting = 'Boa noite';
            
            greetingEl.textContent = `${greeting}, ${userName}!`;
        }
    } catch (error) {
        console.error('Erro ao exibir saudação:', error);
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Atualizar saudação do usuário
    displayUserGreeting();
    
    // Atualizar status de conexão
    if (navigator.onLine) {
        updateSyncStatusIndicator('online', 'Online');
    } else {
        updateSyncStatusIndicator('offline', 'Offline');
    }
});

console.log('Sync UI Enhancements module loaded');