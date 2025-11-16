// supabase-sync.js - Sistema de sincronização com Supabase

// Configuração do Supabase
const SUPABASE_URL = 'https://mhrbrjrvflhyyznjuusy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ocmJyanJ2ZmxoeXl6bmp1dXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMDQ3NzMsImV4cCI6MjA3ODc4MDc3M30.H7KzgVWQYg1mI0AR_PO4XqYGLtLD9ejId3G27l1vp60';

let supabaseClient = null;
let syncInterval = null;
const SYNC_INTERVAL_MS = 30 * 60 * 1000; // 30 minutos

// Inicializar cliente Supabase
function initSupabase() {
    if (typeof supabase === 'undefined') {
        console.error('Biblioteca Supabase não carregada');
        return false;
    }
    
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return true;
}

// Verificar autenticação
async function checkAuth() {
    if (!supabaseClient) {
        if (!initSupabase()) return false;
    }

    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error || !session) {
            // Redirecionar para landing page se não estiver autenticado
            window.location.href = '/landingpage.html';
            return false;
        }
        
        // Salvar sessão localmente
        localStorage.setItem('calm_mind_session', JSON.stringify(session));
        return true;
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        return false;
    }
}

// Logout
async function logout() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        
        localStorage.removeItem('calm_mind_session');
        localStorage.removeItem('calm_mind_user');
        window.location.href = '/landingpage.html';
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    }
}

// Obter ID do usuário atual
function getCurrentUserId() {
    const session = JSON.parse(localStorage.getItem('calm_mind_session') || '{}');
    return session?.user?.id;
}

// Sincronizar dados do IndexedDB com Supabase
async function syncToSupabase() {
    const userId = getCurrentUserId();
    if (!userId) {
        console.log('Usuário não autenticado, pulando sincronização');
        updateSyncStatusUI('offline', 'Usuário não autenticado');
        return;
    }

    if (!navigator.onLine) {
        console.log('Sem conexão, sincronização adiada');
        updateSyncStatusUI('offline', 'Sem conexão à internet');
        return;
    }

    console.log('Iniciando sincronização com Supabase...');
    updateSyncStatusUI('syncing', 'Sincronizando dados...');

    try {
        // Sincronizar registros de humor
        await syncMoodEntries(userId);
        
        // Sincronizar entradas do diário
        await syncDiaryEntries(userId);
        
        // Sincronizar sessões de respiração
        await syncBreathingSessions(userId);
        
        // Sincronizar registros de sono
        await syncSleepEntries(userId);
        
        console.log('Sincronização concluída com sucesso!');
        showToast('Dados sincronizados com sucesso! ☁️');
        updateSyncStatusUI('synced', 'Dados sincronizados', new Date());
        
        // Atualizar timestamp da última sincronização
        localStorage.setItem('last_sync', new Date().toISOString());
    } catch (error) {
        console.error('Erro na sincronização:', error);
        showToast('Erro ao sincronizar dados', true);
        updateSyncStatusUI('error', 'Erro na sincronização');
    }
}

// Sincronizar registros de humor
async function syncMoodEntries(userId) {
    const localEntries = await getAllFromStore('moodEntries');
    
    // Filtrar apenas entradas não sincronizadas
    const unsyncedEntries = localEntries.filter(entry => !entry.synced);
    
    if (unsyncedEntries.length === 0) {
        console.log('Nenhum registro de humor para sincronizar');
        return;
    }

    console.log(`Sincronizando ${unsyncedEntries.length} registros de humor...`);

    for (const entry of unsyncedEntries) {
        try {
            const { data, error } = await supabaseClient
                .from('mood_entries')
                .upsert({
                    user_id: userId,
                    local_id: entry.id,
                    date: entry.date,
                    mood: entry.mood,
                    anxiety: entry.anxiety,
                    notes: entry.notes,
                    timestamp: entry.timestamp
                }, {
                    onConflict: 'user_id,local_id'
                });

            if (error) throw error;

            // Marcar como sincronizado no IndexedDB
            await updateSyncStatus('moodEntries', entry.id);
        } catch (error) {
            console.error('Erro ao sincronizar registro de humor:', error);
        }
    }
}

// Sincronizar entradas do diário
async function syncDiaryEntries(userId) {
    const localEntries = await getAllFromStore('diaryEntries');
    const unsyncedEntries = localEntries.filter(entry => !entry.synced);
    
    if (unsyncedEntries.length === 0) {
        console.log('Nenhuma entrada de diário para sincronizar');
        return;
    }

    console.log(`Sincronizando ${unsyncedEntries.length} entradas de diário...`);

    for (const entry of unsyncedEntries) {
        try {
            const { data, error } = await supabaseClient
                .from('diary_entries')
                .upsert({
                    user_id: userId,
                    local_id: entry.id,
                    date: entry.date,
                    title: entry.title,
                    content: entry.content,
                    tags: entry.tags,
                    timestamp: entry.timestamp
                }, {
                    onConflict: 'user_id,local_id'
                });

            if (error) throw error;

            await updateSyncStatus('diaryEntries', entry.id);
        } catch (error) {
            console.error('Erro ao sincronizar entrada de diário:', error);
        }
    }
}

// Sincronizar sessões de respiração
async function syncBreathingSessions(userId) {
    const localSessions = await getAllFromStore('breathingSessions');
    const unsyncedSessions = localSessions.filter(session => !session.synced);
    
    if (unsyncedSessions.length === 0) {
        console.log('Nenhuma sessão de respiração para sincronizar');
        return;
    }

    console.log(`Sincronizando ${unsyncedSessions.length} sessões de respiração...`);

    for (const session of unsyncedSessions) {
        try {
            const { data, error } = await supabaseClient
                .from('breathing_sessions')
                .upsert({
                    user_id: userId,
                    local_id: session.id,
                    date: session.date,
                    exercise: session.exercise,
                    duration: session.duration,
                    completed: session.completed,
                    timestamp: session.timestamp
                }, {
                    onConflict: 'user_id,local_id'
                });

            if (error) throw error;

            await updateSyncStatus('breathingSessions', session.id);
        } catch (error) {
            console.error('Erro ao sincronizar sessão de respiração:', error);
        }
    }
}

// Sincronizar registros de sono
async function syncSleepEntries(userId) {
    const localEntries = await getAllFromStore('sleepEntries');
    const unsyncedEntries = localEntries.filter(entry => !entry.synced);
    
    if (unsyncedEntries.length === 0) {
        console.log('Nenhum registro de sono para sincronizar');
        return;
    }

    console.log(`Sincronizando ${unsyncedEntries.length} registros de sono...`);

    for (const entry of unsyncedEntries) {
        try {
            const { data, error } = await supabaseClient
                .from('sleep_entries')
                .upsert({
                    user_id: userId,
                    local_id: entry.id,
                    date: entry.date,
                    sleep_time: entry.sleepTime,
                    wake_time: entry.wakeTime,
                    duration: entry.duration,
                    quality: entry.quality,
                    notes: entry.notes,
                    timestamp: entry.timestamp
                }, {
                    onConflict: 'user_id,local_id'
                });

            if (error) throw error;

            await updateSyncStatus('sleepEntries', entry.id);
        } catch (error) {
            console.error('Erro ao sincronizar registro de sono:', error);
        }
    }
}

// Atualizar status de sincronização no IndexedDB
async function updateSyncStatus(storeName, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);

        request.onsuccess = () => {
            const data = request.result;
            data.synced = true;
            data.syncedAt = new Date().toISOString();
            
            const updateRequest = store.put(data);
            updateRequest.onsuccess = () => resolve();
            updateRequest.onerror = () => reject(updateRequest.error);
        };

        request.onerror = () => reject(request.error);
    });
}

// ==========================================
// SINCRONIZAÇÃO BIDIRECIONAL (DOWNLOAD)
// ==========================================

// Baixar dados do Supabase para o IndexedDB
async function syncFromSupabase() {
    const userId = getCurrentUserId();
    if (!userId || !navigator.onLine) return;

    console.log('Baixando dados do Supabase...');

    try {
        // Buscar última sincronização
        const lastSync = localStorage.getItem('last_sync');
        const timestamp = lastSync ? new Date(lastSync) : new Date(0);

        // Baixar registros de humor
        await downloadMoodEntries(userId, timestamp);
        
        // Baixar entradas do diário
        await downloadDiaryEntries(userId, timestamp);
        
        // Baixar sessões de respiração
        await downloadBreathingSessions(userId, timestamp);
        
        // Baixar registros de sono
        await downloadSleepEntries(userId, timestamp);

        console.log('Download de dados concluído!');
    } catch (error) {
        console.error('Erro ao baixar dados:', error);
    }
}

// Baixar registros de humor
async function downloadMoodEntries(userId, since) {
    try {
        const { data, error } = await supabaseClient
            .from('mood_entries')
            .select('*')
            .eq('user_id', userId)
            .gt('updated_at', since.toISOString());
        if (error) throw error;

        for (const entry of data || []) {
            // Verificar se já existe localmente
            const localEntries = await getAllFromStore('moodEntries');
            const exists = localEntries.some(e => e.id === entry.local_id);

            if (!exists) {
                await saveToStore('moodEntries', {
                    id: entry.local_id,
                    date: entry.date,
                    mood: entry.mood,
                    anxiety: entry.anxiety,
                    notes: entry.notes,
                    timestamp: entry.timestamp,
                    synced: true,
                    syncedAt: entry.updated_at
                });
            }
        }
    } catch (error) {
        console.error('Erro ao baixar registros de humor:', error);
    }
}

// Baixar entradas do diário
async function downloadDiaryEntries(userId, since) {
    try {
        const { data, error } = await supabaseClient
            .from('diary_entries')
            .select('*')
            .eq('user_id', userId)
            .gt('updated_at', since.toISOString());
        if (error) throw error;

        for (const entry of data || []) {
            // Verificar se já existe localmente
            const localEntries = await getAllFromStore('diaryEntries');
            const exists = localEntries.some(e => e.id === entry.local_id);

            if (!exists) {
                await saveToStore('diaryEntries', {
                    id: entry.local_id,
                    date: entry.date,
                    title: entry.title,
                    content: entry.content,
                    tags: entry.tags,
                    timestamp: entry.timestamp,
                    synced: true,
                    syncedAt: entry.updated_at
                });
            }
        }
    } catch (error) {
        console.error('Erro ao baixar entradas de diário:', error);
    }
}

// Baixar sessões de respiração
async function downloadBreathingSessions(userId, since) {
    try {
        const { data, error } = await supabaseClient
            .from('breathing_sessions')
            .select('*')
            .eq('user_id', userId)
            .gt('updated_at', since.toISOString());
        if (error) throw error;

        for (const session of data || []) {
            // Verificar se já existe localmente
            const localSessions = await getAllFromStore('breathingSessions');
            const exists = localSessions.some(s => s.id === session.local_id);

            if (!exists) {
                await saveToStore('breathingSessions', {
                    id: session.local_id,
                    date: session.date,
                    exercise: session.exercise,
                    duration: session.duration,
                    completed: session.completed,
                    timestamp: session.timestamp,
                    synced: true,
                    syncedAt: session.updated_at
                });
            }
        }
    } catch (error) {
        console.error('Erro ao baixar sessões de respiração:', error);
    }
}

// Baixar registros de sono
async function downloadSleepEntries(userId, since) {
    try {
        const { data, error } = await supabaseClient
            .from('sleep_entries')
            .select('*')
            .eq('user_id', userId)
            .gt('updated_at', since.toISOString());
        if (error) throw error;

        for (const entry of data || []) {
            // Verificar se já existe localmente
            const localEntries = await getAllFromStore('sleepEntries');
            const exists = localEntries.some(e => e.id === entry.local_id);

            if (!exists) {
                await saveToStore('sleepEntries', {
                    id: entry.local_id,
                    date: entry.date,
                    sleepTime: entry.sleep_time,
                    wakeTime: entry.wake_time,
                    duration: entry.duration,
                    quality: entry.quality,
                    notes: entry.notes,
                    timestamp: entry.timestamp,
                    synced: true,
                    syncedAt: entry.updated_at
                });
            }
        }
    } catch (error) {
        console.error('Erro ao baixar registros de sono:', error);
    }
}

// Iniciar sincronização periódica
function startAutoSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
    }
    
    // Sincronizar imediatamente ao iniciar
    syncToSupabase().catch(err => {
        console.log('Primeira sincronização falhou, tentará novamente:', err);
    });
    
    syncInterval = setInterval(async () => {
        await syncToSupabase();
        await syncFromSupabase();
    }, SYNC_INTERVAL_MS);
    
    console.log(`Sincronização automática iniciada a cada ${SYNC_INTERVAL_MS/1000/60} minutos`);
}

// Sincronização manual
async function manualSync() {
    console.log('Sincronização manual iniciada...');
    showToast('Iniciando sincronização...');
    await syncToSupabase();
    await syncFromSupabase();
}

// Atualizar UI de status de sincronização
function updateSyncStatusUI(status, message, timestamp = null) {
    const syncIndicator = document.getElementById('syncIndicator');
    const syncText = document.getElementById('syncText');
    const lastSyncTime = document.getElementById('lastSyncTime');
    
    if (!syncIndicator || !syncText) return;
    
    switch (status) {
        case 'offline':
            syncIndicator.textContent = '🔴';
            syncText.textContent = message || 'Offline';
            break;
        case 'syncing':
            syncIndicator.textContent = '🔄';
            syncText.textContent = message || 'Sincronizando...';
            break;
        case 'synced':
            syncIndicator.textContent = '🟢';
            syncText.textContent = message || 'Sincronizado';
            if (timestamp) {
                lastSyncTime.textContent = `Última sincronização: ${formatTimeAgo(timestamp)}`;
            }
            break;
        case 'error':
            syncIndicator.textContent = '❌';
            syncText.textContent = message || 'Erro na sincronização';
            break;
        default:
            syncIndicator.textContent = '⚪';
            syncText.textContent = message || 'Verificando conexão...';
    }
}

// Formatar tempo relativo
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

// Verificar status de conexão
function checkConnectionStatus() {
    if (navigator.onLine) {
        updateSyncStatusUI('online', 'Online');
    } else {
        updateSyncStatusUI('offline', 'Offline');
    }
}

// Monitorar mudanças na conexão
window.addEventListener('online', checkConnectionStatus);
window.addEventListener('offline', checkConnectionStatus);

// Inicializar verificação de conexão
checkConnectionStatus();

console.log('Supabase Sync module loaded');