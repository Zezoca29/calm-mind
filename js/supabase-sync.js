// supabase-sync.js - Sistema de sincronização com Supabase

// Configuração do Supabase
const SUPABASE_URL = 'https://mhrbrjrvflhyyznjuusy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ocmJyanJ2ZmxoeXl6bmp1dXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMDQ3NzMsImV4cCI6MjA3ODc4MDc3M30.H7KzgVWQYg1mI0AR_PO4XqYGLtLD9ejId3G27l1vp60';

let supabaseClient = null;
let syncInterval = null;
let lastSyncAttempt = 0;
let isSyncing = false;
let pendingSyncChanges = false;

// Aumentar intervalo de sincronização para 2 horas para melhor usabilidade
const SYNC_INTERVAL_MS = 2 * 60 * 60 * 1000; // 2 horas
const MIN_SYNC_INTERVAL_MS = 5 * 60 * 1000; // Mínimo 5 minutos entre sincronizações automáticas
const DEBOUNCE_SYNC_MS = 10 * 1000; // Aguardar 10 segundos após última mudança antes de sincronizar

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

// Variáveis globais para debounce de sincronização automática
let debounceTimeoutId = null;
let lastAutomaticSyncTime = 0;

// Sincronizar com debounce para evitar múltiplas sincronizações frequentes
function scheduleDebouncedSync() {
    // Limpar timeout anterior
    if (debounceTimeoutId) {
        clearTimeout(debounceTimeoutId);
    }
    
    // Marcar que há mudanças pendentes
    pendingSyncChanges = true;
    
    // Verificar se tempo mínimo passou desde última sincronização
    const now = Date.now();
    const timeSinceLastSync = now - lastAutomaticSyncTime;
    
    // Se passou tempo suficiente, sincronizar logo
    if (timeSinceLastSync >= MIN_SYNC_INTERVAL_MS) {
        debounceTimeoutId = setTimeout(() => {
            lastAutomaticSyncTime = Date.now();
            syncToSupabase().catch(err => {
                console.log('Sincronização automática ao salvar falhou:', err);
            });
        }, DEBOUNCE_SYNC_MS);
    } else {
        // Caso contrário, aguardar o tempo restante
        const timeToWait = MIN_SYNC_INTERVAL_MS - timeSinceLastSync + DEBOUNCE_SYNC_MS;
        debounceTimeoutId = setTimeout(() => {
            lastAutomaticSyncTime = Date.now();
            syncToSupabase().catch(err => {
                console.log('Sincronização automática ao salvar falhou:', err);
            });
        }, timeToWait);
    }
}

// Sincronizar dados do IndexedDB com Supabase com controle de frequência
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

    // Evitar sincronizações muito frequentes (mínimo 5 minutos)
    const now = Date.now();
    if (now - lastSyncAttempt < MIN_SYNC_INTERVAL_MS) {
        console.log('Sincronização muito frequente, aguardando...');
        pendingSyncChanges = true;
        return;
    }

    // Se já está sincronizando, marcar como pendente e retornar
    if (isSyncing) {
        console.log('Sincronização já em andamento, mudanças serão sincronizadas em breve');
        pendingSyncChanges = true;
        return;
    }

    isSyncing = true;
    lastSyncAttempt = now;
    pendingSyncChanges = false;

    console.log('Iniciando sincronização com Supabase...');
    updateSyncStatusUI('syncing', 'Sincronizando dados...');

    try {
        // Executar sincronizações em background usando Promise.all para paralelizar
        // mas sem bloquear a UI com await sequencial
        await Promise.all([
            syncMoodEntries(userId).catch(err => {
                console.error('Erro ao sincronizar registros de humor:', err);
                return null;
            }),
            syncDiaryEntries(userId).catch(err => {
                console.error('Erro ao sincronizar entradas do diário:', err);
                return null;
            }),
            syncBreathingSessions(userId).catch(err => {
                console.error('Erro ao sincronizar sessões de respiração:', err);
                return null;
            }),
            syncSleepEntries(userId).catch(err => {
                console.error('Erro ao sincronizar registros de sono:', err);
                return null;
            })
        ]);
        
        // Atualizar timestamp da última sincronização bem-sucedida
        localStorage.setItem('last_sync', new Date().toISOString());
        updateSyncStatusUI('synced', 'Sincronizado', new Date());
        
        // Se houve mudanças pendentes e o tempo permitir, sincronizar novamente
        if (pendingSyncChanges) {
            setTimeout(() => {
                syncToSupabase().catch(err => console.error('Sincronização agendada falhou:', err));
            }, 30 * 1000);
        }
        
        // Trazer dados atualizados do Supabase após sincronizar local
        syncFromSupabase().catch(err => console.error('Download de dados falhou:', err));
        
    } catch (error) {
        console.error('Erro crítico na sincronização:', error);
        updateSyncStatusUI('error', 'Erro na sincronização');
    } finally {
        isSyncing = false;
    }
}

// Sincronizar registros de humor
async function syncMoodEntries(userId) {
    const localEntries = await getAllFromStore('moodEntries');
    
    // Filtrar apenas entradas não sincronizadas com ID válido
    const unsyncedEntries = localEntries.filter(entry => !entry.synced && entry.id);
    
    if (unsyncedEntries.length === 0) {
        return;
    }

    for (const entry of unsyncedEntries) {
        try {
            const { data, error } = await supabaseClient
                .from('mood_entries')
                .upsert({
                    user_id: userId,
                    local_id: entry.id,
                    date: entry.date,
                    mood: entry.mood,
                    anxiety: entry.anxiety || 0,
                    notes: entry.notes || '',
                    timestamp: entry.timestamp || new Date().toISOString()
                }, {
                    onConflict: 'user_id,local_id'
                });

            if (error) {
                console.error('Erro Supabase ao sincronizar humor:', error);
                throw error;
            }

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
    const unsyncedEntries = localEntries.filter(entry => !entry.synced && entry.id);
    
    if (unsyncedEntries.length === 0) {
        return;
    }

    for (const entry of unsyncedEntries) {
        try {
            const { data, error } = await supabaseClient
                .from('diary_entries')
                .upsert({
                    user_id: userId,
                    local_id: entry.id,
                    date: entry.date,
                    title: entry.title || '',
                    content: entry.content || '',
                    tags: entry.tags || [],
                    timestamp: entry.timestamp || new Date().toISOString()
                }, {
                    onConflict: 'user_id,local_id'
                });

            if (error) {
                console.error('Erro Supabase ao sincronizar diário:', error);
                throw error;
            }

            await updateSyncStatus('diaryEntries', entry.id);
        } catch (error) {
            console.error('Erro ao sincronizar entrada de diário:', error);
        }
    }
}

// Sincronizar sessões de respiração
async function syncBreathingSessions(userId) {
    const localSessions = await getAllFromStore('breathingSessions');
    const unsyncedSessions = localSessions.filter(session => !session.synced && session.id);
    
    if (unsyncedSessions.length === 0) {
        return;
    }

    for (const session of unsyncedSessions) {
        try {
            const { data, error } = await supabaseClient
                .from('breathing_sessions')
                .upsert({
                    user_id: userId,
                    local_id: session.id,
                    date: session.date,
                    exercise: session.exercise || 'box breathing',
                    duration: session.duration || 0,
                    completed: session.completed || false,
                    timestamp: session.timestamp || new Date().toISOString()
                }, {
                    onConflict: 'user_id,local_id'
                });

            if (error) {
                console.error('Erro Supabase ao sincronizar respiração:', error);
                throw error;
            }

            await updateSyncStatus('breathingSessions', session.id);
        } catch (error) {
            console.error('Erro ao sincronizar sessão de respiração:', error);
        }
    }
}

// Sincronizar registros de sono
async function syncSleepEntries(userId) {
    const localEntries = await getAllFromStore('sleepEntries');
    const unsyncedEntries = localEntries.filter(entry => !entry.synced && entry.id);
    
    if (unsyncedEntries.length === 0) {
        return;
    }

    for (const entry of unsyncedEntries) {
        try {
            // Validate duration to prevent numeric overflow in database (NUMERIC(4,2) max is 99.99)
            let duration = entry.duration || 0;
            if (typeof duration === 'string') {
                duration = parseFloat(duration);
            }
            
            // Cap duration at maximum allowed value to prevent overflow
            if (duration > 99.99) {
                console.warn(`Duração do sono muito longa (${duration}h), limitando a 99.99h para evitar overflow numérico`);
                duration = 99.99;
            }

            const { data, error } = await supabaseClient
                .from('sleep_entries')
                .upsert({
                    user_id: userId,
                    local_id: entry.id,
                    date: entry.date,
                    sleep_time: entry.sleepTime || null,
                    wake_time: entry.wakeTime || null,
                    duration: duration,
                    quality: entry.quality || 3,
                    notes: entry.notes || '',
                    timestamp: entry.timestamp || new Date().toISOString()
                }, {
                    onConflict: 'user_id,local_id'
                });

            if (error) {
                console.error('Erro Supabase ao sincronizar sono:', error);
                throw error;
            }

            await updateSyncStatus('sleepEntries', entry.id);
        } catch (error) {
            console.error('Erro ao sincronizar registro de sono:', error);
            // Log the specific entry that caused the error for debugging
            console.error('Entry data:', entry);
        }
    }
}

// Atualizar status de sincronização no IndexedDB
async function updateSyncStatus(storeName, id) {
    return new Promise((resolve, reject) => {
        try {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => {
                const data = request.result;
                if (!data) {
                    console.warn(`Registro não encontrado para atualizar: ${storeName}/${id}`);
                    resolve();
                    return;
                }
                
                data.synced = true;
                data.syncedAt = new Date().toISOString();
                
                const updateRequest = store.put(data);
                updateRequest.onsuccess = () => {
                    console.log(`Status de sincronização atualizado: ${storeName}/${id}`);
                    resolve();
                };
                updateRequest.onerror = () => {
                    console.error(`Erro ao atualizar status: ${updateRequest.error}`);
                    reject(updateRequest.error);
                };
            };

            request.onerror = () => {
                console.error(`Erro ao obter registro: ${request.error}`);
                reject(request.error);
            };
            
            transaction.onerror = () => {
                console.error(`Erro na transação: ${transaction.error}`);
                reject(transaction.error);
            };
        } catch (error) {
            console.error('Erro ao criar transação:', error);
            reject(error);
        }
    });
}

// ==========================================
// SINCRONIZAÇÃO BIDIRECIONAL (DOWNLOAD)
// ==========================================

// Baixar dados do Supabase para o IndexedDB
async function syncFromSupabase() {
    const userId = getCurrentUserId();
    if (!userId) {
        console.warn('❌ Usuário não autenticado para download de dados');
        return;
    }
    
    if (!navigator.onLine) {
        console.log('🔴 Offline - skipping download');
        return;
    }

    console.log(`📥 Iniciando download de dados para usuário: ${userId}`);

    try {
        // Buscar última sincronização
        const lastSync = localStorage.getItem('last_sync');
        const timestamp = lastSync ? new Date(lastSync) : new Date(0);
        console.log(`📅 Buscando dados modificados após: ${timestamp.toISOString()}`);

        // Baixar registros de humor
        await downloadMoodEntries(userId, timestamp);
        
        // Baixar entradas do diário
        await downloadDiaryEntries(userId, timestamp);
        
        // Baixar sessões de respiração
        await downloadBreathingSessions(userId, timestamp);
        
        // Baixar registros de sono
        await downloadSleepEntries(userId, timestamp);
        
        console.log('✅ Download de dados concluído com sucesso');
    } catch (error) {
        console.error('❌ Erro ao baixar dados:', error);
    }
}

// Baixar registros de humor
async function downloadMoodEntries(userId, since) {
    try {
        console.log(`🔄 Buscando registros de humor para usuário: ${userId}`);
        
        const { data, error } = await supabaseClient
            .from('mood_entries')
            .select('*')
            .eq('user_id', userId)
            .gte('updated_at', since.toISOString())
            .order('updated_at', { ascending: false });
        
        if (error) {
            console.error('❌ Erro Supabase ao buscar humores:', error);
            throw error;
        }

        console.log(`📊 Encontrados ${data?.length || 0} registros de humor`);

        if (!data || data.length === 0) {
            console.log('ℹ️ Nenhum novo registro de humor para sincronizar');
            return;
        }

        for (const entry of data) {
            try {
                // Verificar se já existe localmente pelo local_id
                const localEntries = await getAllFromStore('moodEntries');
                const exists = localEntries.some(e => e.id === entry.local_id);

                if (!exists) {
                    console.log(`💾 Salvando humor baixado: ${entry.local_id}`);
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
                } else {
                    console.log(`ℹ️ Registro ${entry.local_id} já existe localmente`);
                }
            } catch (err) {
                console.error('❌ Erro ao processar humor baixado:', err);
            }
        }
    } catch (error) {
        console.error('❌ Erro ao baixar registros de humor:', error);
    }
}

// Baixar entradas do diário
async function downloadDiaryEntries(userId, since) {
    try {
        console.log(`🔄 Buscando entradas de diário para usuário: ${userId}`);
        
        const { data, error } = await supabaseClient
            .from('diary_entries')
            .select('*')
            .eq('user_id', userId)
            .gte('updated_at', since.toISOString())
            .order('updated_at', { ascending: false });
        
        if (error) {
            console.error('❌ Erro Supabase ao buscar diários:', error);
            throw error;
        }

        console.log(`📔 Encontradas ${data?.length || 0} entradas de diário`);

        if (!data || data.length === 0) {
            console.log('ℹ️ Nenhuma nova entrada de diário para sincronizar');
            return;
        }

        for (const entry of data) {
            try {
                const localEntries = await getAllFromStore('diaryEntries');
                const exists = localEntries.some(e => e.id === entry.local_id);

                if (!exists) {
                    console.log(`💾 Salvando diário baixado: ${entry.local_id}`);
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
                } else {
                    console.log(`ℹ️ Entrada ${entry.local_id} já existe localmente`);
                }
            } catch (err) {
                console.error('❌ Erro ao processar entrada de diário:', err);
            }
        }
    } catch (error) {
        console.error('❌ Erro ao baixar entradas de diário:', error);
    }
}

// Baixar sessões de respiração
async function downloadBreathingSessions(userId, since) {
    try {
        console.log(`🔄 Buscando sessões de respiração para usuário: ${userId}`);
        
        const { data, error } = await supabaseClient
            .from('breathing_sessions')
            .select('*')
            .eq('user_id', userId)
            .gte('updated_at', since.toISOString())
            .order('updated_at', { ascending: false });
        
        if (error) {
            console.error('❌ Erro Supabase ao buscar sessões de respiração:', error);
            throw error;
        }

        console.log(`🌬️ Encontradas ${data?.length || 0} sessões de respiração`);

        if (!data || data.length === 0) {
            console.log('ℹ️ Nenhuma nova sessão de respiração para sincronizar');
            return;
        }

        for (const session of data) {
            try {
                const localSessions = await getAllFromStore('breathingSessions');
                const exists = localSessions.some(s => s.id === session.local_id);

                if (!exists) {
                    console.log(`💾 Salvando sessão de respiração baixada: ${session.local_id}`);
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
                } else {
                    console.log(`ℹ️ Sessão ${session.local_id} já existe localmente`);
                }
            } catch (err) {
                console.error('❌ Erro ao processar sessão de respiração:', err);
            }
        }
    } catch (error) {
        console.error('❌ Erro ao baixar sessões de respiração:', error);
    }
}

// Baixar registros de sono
async function downloadSleepEntries(userId, since) {
    try {
        console.log(`🔄 Buscando registros de sono para usuário: ${userId}`);
        
        const { data, error } = await supabaseClient
            .from('sleep_entries')
            .select('*')
            .eq('user_id', userId)
            .gte('updated_at', since.toISOString())
            .order('updated_at', { ascending: false });
        
        if (error) {
            console.error('❌ Erro Supabase ao buscar registros de sono:', error);
            throw error;
        }

        console.log(`😴 Encontrados ${data?.length || 0} registros de sono`);

        if (!data || data.length === 0) {
            console.log('ℹ️ Nenhum novo registro de sono para sincronizar');
            return;
        }

        for (const entry of data) {
            try {
                const localEntries = await getAllFromStore('sleepEntries');
                const exists = localEntries.some(e => e.id === entry.local_id);

                if (!exists) {
                    console.log(`💾 Salvando registro de sono baixado: ${entry.local_id}`);
                    
                    // Validate duration to prevent issues with invalid data from server
                    let duration = entry.duration || 0;
                    if (typeof duration === 'number' && duration > 99.99) {
                        console.warn(`Duração do sono muito longa (${duration}h) recebida do servidor, limitando a 99.99h`);
                        duration = 99.99;
                    }
                    
                    await saveToStore('sleepEntries', {
                        id: entry.local_id,
                        date: entry.date,
                        sleepTime: entry.sleep_time,
                        wakeTime: entry.wake_time,
                        duration: duration,
                        quality: entry.quality,
                        notes: entry.notes,
                        timestamp: entry.timestamp,
                        synced: true,
                        syncedAt: entry.updated_at
                    });
                } else {
                    console.log(`ℹ️ Registro ${entry.local_id} já existe localmente`);
                }
            } catch (err) {
                console.error('❌ Erro ao processar registro de sono:', err);
            }
        }
    } catch (error) {
        console.error('❌ Erro ao baixar registros de sono:', error);
    }
}

// Iniciar sincronização periódica em background sem impactar usabilidade
function startAutoSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
    }
    
    console.log('Iniciando sincronização automática em background...');
    
    // Sincronizar imediatamente apenas se houver dados não sincronizados
    syncToSupabase().catch(err => {
        console.log('Primeira sincronização falhou, tentará novamente:', err);
    });
    
    // Sincronizar a cada 2 horas em background sem interrupções
    // Usar requestIdleCallback se disponível para sincronizar apenas quando browser está ocioso
    if ('requestIdleCallback' in window) {
        // Usar requestIdleCallback para não impactar performance
        let idleCallbackId = null;
        
        syncInterval = setInterval(() => {
            idleCallbackId = requestIdleCallback(() => {
                syncToSupabase().catch(err => console.log('Sincronização automática falhou:', err));
                syncFromSupabase().catch(err => console.log('Download automático falhou:', err));
            }, { timeout: 5000 }); // Timeout de 5 segundos para garantir execução
        }, SYNC_INTERVAL_MS);
    } else {
        // Fallback para setInterval normal em browsers que não suportam requestIdleCallback
        syncInterval = setInterval(async () => {
            await syncToSupabase();
            await syncFromSupabase();
        }, SYNC_INTERVAL_MS);
    }
}

// Sincronização manual
async function manualSync() {
    try {
        await syncToSupabase();
        await syncFromSupabase();
    } catch (error) {
        console.error('Erro na sincronização manual:', error);
    }
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