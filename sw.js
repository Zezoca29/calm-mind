// Service Worker para Calm Mind PWA
const CACHE_NAME = 'calm-mind-v1.2';
const STATIC_CACHE = 'calm-mind-static-v1.2';
const DYNAMIC_CACHE = 'calm-mind-dynamic-v1.2';

// Assets para cache estático (críticos para funcionamento offline)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com/3.3.0',
  // Adicione outros assets críticos aqui
];

// Assets para cache dinâmico (carregados conforme necessário)
const DYNAMIC_ASSETS = [
  'https://cdnjs.cloudflare.com/',
];

// Instalar Service Worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache estático
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Pular espera para ativar imediatamente
      self.skipWaiting()
    ]).then(() => {
      console.log('✅ Service Worker installed successfully');
    }).catch(error => {
      console.error('❌ Service Worker installation failed:', error);
    })
  );
});

// Ativar Service Worker
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Assumir controle de todas as abas
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker activated successfully');
    })
  );
});

// Interceptar requisições (estratégia Cache First)
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Pular requisições não HTTP/HTTPS
  if (!request.url.startsWith('http')) return;
  
  // Estratégia diferente para diferentes tipos de recurso
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else if (isDynamicAsset(request)) {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
  } else if (isNavigationRequest(request)) {
    event.respondWith(navigationStrategy(request));
  } else {
    event.respondWith(cacheFirstStrategy(request, DYNAMIC_CACHE));
  }
});

// Verificar se é um asset estático
function isStaticAsset(request) {
  return STATIC_ASSETS.some(asset => request.url.includes(asset)) ||
         request.url.includes('tailwind') ||
         request.url.includes('.css') ||
         request.url.includes('.js') ||
         request.url.includes('.woff') ||
         request.url.includes('.woff2');
}

// Verificar se é um asset dinâmico
function isDynamicAsset(request) {
  return DYNAMIC_ASSETS.some(asset => request.url.includes(asset)) ||
         request.url.includes('cdn') ||
         request.url.includes('api');
}

// Verificar se é uma requisição de navegação
function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

// Estratégia Cache First (para assets estáticos)
async function cacheFirstStrategy(request, cacheName) {
  try {
    // Primeiro, tenta buscar no cache
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('📁 Serving from cache:', request.url);
      
      // Atualizar cache em background
      fetchAndCache(request, cache);
      
      return cachedResponse;
    }
    
    // Se não estiver em cache, busca da rede
    console.log('🌐 Fetching from network:', request.url);
    const networkResponse = await fetch(request);
    
    // Adiciona ao cache se a resposta for válida
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('❌ Cache First failed:', error);
    
    // Se tudo falhar, retorna página offline para navegação
    if (isNavigationRequest(request)) {
      return getOfflinePage();
    }
    
    // Para outros recursos, retorna resposta de erro
    return new Response('Recurso não disponível offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Estratégia Network First (para dados dinâmicos)
async function networkFirstStrategy(request, cacheName) {
  try {
    // Primeiro, tenta buscar da rede
    console.log('🌐 Network first for:', request.url);
    const networkResponse = await fetch(request);
    
    // Se sucesso, atualiza cache
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('🌐 Network failed, trying cache:', request.url);
    
    // Se rede falhar, tenta cache
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('📁 Serving from cache (fallback):', request.url);
      return cachedResponse;
    }
    
    // Se tudo falhar
    return new Response('Dados não disponíveis offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Estratégia para navegação (páginas HTML)
async function navigationStrategy(request) {
  try {
    // Tenta buscar da rede primeiro
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Atualiza cache
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
    
  } catch (error) {
    // Se rede falhar, busca do cache
    console.log('🌐 Navigation network failed, trying cache');
    
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Como último recurso, retorna página principal se estiver em cache
    const indexCache = await cache.match('/') || await cache.match('/index.html');
    if (indexCache) {
      return indexCache;
    }
    
    // Página offline de emergência
    return getOfflinePage();
  }
}

// Buscar e atualizar cache em background
async function fetchAndCache(request, cache) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
  } catch (error) {
    console.log('Background cache update failed:', error);
  }
}

// Página offline de emergência
function getOfflinePage() {
  return new Response(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - Calm Mind</title>
        <style>
            body {
                font-family: system-ui, -apple-system, sans-serif;
                background: linear-gradient(135deg, #1f2937, #111827);
                color: white;
                margin: 0;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                text-align: center;
            }
            .container {
                max-width: 400px;
                padding: 2rem;
            }
            .icon {
                font-size: 4rem;
                margin-bottom: 1rem;
            }
            h1 {
                color: #6366f1;
                margin-bottom: 1rem;
            }
            p {
                color: #9ca3af;
                margin-bottom: 2rem;
            }
            .button {
                background: #6366f1;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 0.5rem;
                font-size: 1rem;
                cursor: pointer;
                transition: background 0.3s;
            }
            .button:hover {
                background: #5b21b6;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">🧘‍♀️</div>
            <h1>Calm Mind</h1>
            <p>Você está offline, mas pode continuar usando o app com os dados salvos localmente.</p>
            <button class="button" onclick="window.location.reload()">
                Tentar Novamente
            </button>
        </div>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// Listener para mensagens do cliente (sincronização, notificações, etc.)
self.addEventListener('message', event => {
  console.log('💬 Message received:', event.data);
  
  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'CACHE_STATS':
      getCacheStats().then(stats => {
        event.ports[0].postMessage(stats);
      });
      break;
  }
});

// Limpar todos os caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

// Obter estatísticas do cache
async function getCacheStats() {
  const cacheNames = await caches.keys();
  const stats = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    stats[cacheName] = keys.length;
  }
  
  return stats;
}

// Background Sync (para sincronizar dados quando a conexão voltar)
self.addEventListener('sync', event => {
  console.log('🔄 Background sync:', event.tag);
  
  switch (event.tag) {
    case 'sync-mood-data':
      event.waitUntil(syncMoodData());
      break;
      
    case 'sync-diary-data':
      event.waitUntil(syncDiaryData());
      break;
      
    case 'sync-breathing-data':
      event.waitUntil(syncBreathingData());
      break;
  }
});

// Funções de sincronização (implementar conforme sua API backend)
async function syncMoodData() {
  try {
    console.log('🔄 Syncing mood data...');
    // Implementar sincronização com backend aqui
    // Por exemplo: buscar dados pendentes do IndexedDB e enviar para API
    
    // Notificar clientes sobre sincronização
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        data: 'mood_data'
      });
    });
    
  } catch (error) {
    console.error('❌ Mood data sync failed:', error);
  }
}

async function syncDiaryData() {
  try {
    console.log('🔄 Syncing diary data...');
    // Implementar sincronização de dados do diário
    
  } catch (error) {
    console.error('❌ Diary data sync failed:', error);
  }
}

async function syncBreathingData() {
  try {
    console.log('🔄 Syncing breathing data...');
    // Implementar sincronização de sessões de respiração
    
  } catch (error) {
    console.error('❌ Breathing data sync failed:', error);
  }
}

// Push Notifications (para lembretes de bem-estar)
self.addEventListener('push', event => {
  console.log('🔔 Push notification received:', event.data?.text());
  
  const options = {
    body: event.data?.text() || 'Hora de cuidar da sua saúde mental! 🧘‍♀️',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [100, 50, 100],
    tag: 'calm-mind-reminder',
    actions: [
      {
        action: 'open',
        title: 'Abrir App',
        icon: '/action-open.png'
      },
      {
        action: 'dismiss',
        title: 'Dispensar',
        icon: '/action-close.png'
      }
    ],
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('Calm Mind', options)
  );
});

// Gerenciar cliques em notificações
self.addEventListener('notificationclick', event => {
  console.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || event.action === '') {
    // Abrir ou focar no app
    event.waitUntil(
      clients.matchAll().then(clientsList => {
        // Se já há uma aba aberta, foque nela
        for (const client of clientsList) {
          if (client.url.includes('/') && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Caso contrário, abra nova aba
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
  
  // Registrar interação para analytics (se implementado)
  if (event.action !== 'dismiss') {
    // Implementar tracking de engajamento
  }
});

console.log('🚀 Service Worker loaded successfully - Calm Mind v1.2');