# 🧪 Guia de Testes - Sincronização Otimizada

## ✅ Pré-requisitos para Teste

- [ ] Abrir DevTools (F12)
- [ ] Ir à aba Console
- [ ] Ter conta Supabase conectada
- [ ] Estar online
- [ ] Ter dados para salvar (registros de humor, diário, etc)

---

## 🔍 Teste 1: Validar Débounce ao Salvar

### Objetivo
Verificar que múltiplos salvamentos em curto espaço resultam em apenas 1-2 sincronizações

### Passos
1. Abra DevTools → Console
2. Digite: `console.log('Iniciar teste de débounce')`
3. Adicione 5 registros de humor rapidamente (5-10 segundos)
4. Adicione 3 entradas de diário rapidamente
5. Observe logs

### Resultado Esperado
```
✅ Logs mostram débounce em ação:
"Mudanças pendentes detectadas, agendando nova sincronização"
"Sincronização já em andamento, mudanças serão sincronizadas em breve"

❌ NÃO deve mostrar:
"Iniciando sincronização" (múltiplas vezes em poucos segundos)
```

### Validação
```javascript
// No console, após adicionar 5 dados em 10 segundos:
// Esperado: 1-2 sincronizações
// Não esperado: 5+ sincronizações

// Log de sucesso:
// "Sincronização concluída com sucesso!"
```

---

## 🔍 Teste 2: Validar Intervalo Mínimo de 5 Minutos

### Objetivo
Verificar que sincronizações automáticas ao salvar respeitam mínimo de 5 minutos

### Passos
1. Salve um registro (hora: 10:00)
2. Note o timestamp no log
3. Tente salvar outro registro imediatamente (10:01)
4. Observe: Deve dizer "Aguardando" ou "mínimo não atingido"
5. Aguarde ~5 minutos (10:05)
6. Salve outro registro
7. Observe: Deve sincronizar normalmente

### Resultado Esperado
```
10:00 → Sync completada
10:01 → "Sincronização muito frequente, aguardando..."
10:05 → Novo sync permitido
```

### Validação
```javascript
// Verificar no console:
lastSyncAttempt // mostra timestamp
MIN_SYNC_INTERVAL_MS // deve ser 5min = 300000ms
```

---

## 🔍 Teste 3: Validar Sincronização em Paralelo (5x mais rápido)

### Objetivo
Verificar que sincronização é muito mais rápida que antes

### Passos
1. Abra DevTools → Console
2. Digite: `console.time('sync_manual')`
3. Clique em "Sincronizar" (botão ☁️)
4. Aguarde conclusão
5. Digite: `console.timeEnd('sync_manual')`
6. Note o tempo

### Resultado Esperado
```
✅ Tempo: 500-1500ms (meio a um segundo)
❌ Não esperado: 2-3 segundos

Comparativo:
- Antes (sequencial): 2-3 segundos
- Depois (paralelo): 500-1000ms
- Melhoria: 3-5x mais rápido
```

### Validação
```javascript
// No console:
console.time('sync');
await manualSync();
console.timeEnd('sync');

// Resultado esperado: sync: 500-1500ms
```

---

## 🔍 Teste 4: Validar Sem Bloqueio de UI

### Objetivo
Verificar que sincronização não bloqueia UI

### Passos
1. Abra DevTools → Performance
2. Clique em ●Rec (gravar)
3. Clique "Sincronizar" (☁️)
4. Aguarde 5 segundos
5. Clique Stop
6. Analise o gráfico

### Resultado Esperado
```
✅ Main thread não fica travado (sem picos)
✅ Frames continuam 60fps
✅ Nenhuma "jank" (travamento visual)

❌ Não deve ter:
- Picos altos de uso de CPU
- Frames com mais de 16ms
- Long tasks (tarefas longas)
```

### Validação Visual
- Gráfico deve ser suave, sem picos
- Nenhum aviso de "Long Task" no Performance

---

## 🔍 Teste 5: Validar Background Sync (requestIdleCallback)

### Objetivo
Verificar que sincronização automática usa requestIdleCallback

### Passos
1. Console: `console.log(typeof requestIdleCallback)`
2. Resultado: "function" (disponível)
3. Aguarde 2 horas OR simule setInterval:
   ```javascript
   // Simular sincronização automática
   if ('requestIdleCallback' in window) {
       requestIdleCallback(() => {
           console.log('Sincronizando em background (ocioso)');
           syncToSupabase();
       }, { timeout: 5000 });
   }
   ```

### Resultado Esperado
```
✅ Log aparece: "Sincronizando em background (ocioso)"
✅ Sincronização ocorre sem impacto na UI
✅ Navegador está ocioso enquanto sincroniza

❌ Não esperado:
- Erro de requestIdleCallback não definido
- UI travada durante sincronização
```

---

## 🔍 Teste 6: Validar Mudanças Pendentes

### Objetivo
Verificar que sistema detecta e sincroniza mudanças que ocorreram durante sync

### Passos
1. Inicie sincronização manual (clique ☁️)
2. DURANTE a sincronização, adicione um novo registro
3. Aguarde conclusão
4. Observe logs

### Resultado Esperado
```
✅ Log: "Mudanças pendentes detectadas"
✅ Log: "Agendando nova sincronização"
✅ Após ~30s: nova sincronização automática

❌ Não esperado:
- Novo registro não sincronizado
- Nenhum log de mudanças pendentes
```

---

## 🔍 Teste 7: Validar Intervalo de 2 Horas

### Objetivo
Verificar que sincronização automática está configurada para 2 horas

### Passos
1. Console: `SYNC_INTERVAL_MS`
2. Deve retornar: `7200000` (2 horas em ms)
3. Console: `SYNC_INTERVAL_MS / 1000 / 60` (converter para minutos)
4. Deve retornar: `120`

### Resultado Esperado
```
✅ SYNC_INTERVAL_MS === 7200000
✅ 7200000 / 1000 / 60 === 120 minutos
✅ 120 minutos = 2 horas

❌ Não esperado:
- SYNC_INTERVAL_MS === 1800000 (30 min - antigo)
- SYNC_INTERVAL_MS === 900000 (15 min)
```

---

## 🔍 Teste 8: Validar Configurações de Usuário

### Objetivo
Verificar que usuário pode escolher frequência de sincronização

### Passos
1. Não há botão de configurações visível no header
2. Mas a lógica está em `sync-ui-enhancements.js`
3. Console: `localStorage.getItem('syncFrequency')`
4. Deve retornar: `"120min"` (padrão)
5. Mude para: `localStorage.setItem('syncFrequency', '240min')`
6. Console: `reconfigureAutoSync()`
7. Sincronização deve reconfigurar

### Resultado Esperado
```
✅ Valores possíveis: manual, 60min, 120min, 240min
✅ Padrão: 120min
✅ Reconfigura ao mudar

❌ Não esperado:
- Valores antigos (15min, 30min)
- localStorage vazio
- Erro ao reconfigurar
```

---

## 🔍 Teste 9: Validar Sem Variáveis Duplicadas

### Objetivo
Verificar que não há erro de variáveis duplicadas

### Passos
1. F12 (DevTools) → Console
2. Recarregue página (F5)
3. Observe se há erros

### Resultado Esperado
```
✅ Nenhum erro: "Identifier 'isSyncing' has already been declared"
✅ Sincronização funciona normalmente
✅ Não há conflitos de variáveis

❌ Não esperado:
- SyntaxError sobre 'isSyncing'
- Outros erros de declaração duplicada
```

### Validação
```javascript
// No console, verificar variável global:
typeof isSyncing     // "boolean"
isSyncing            // false (ou true se sincronizando)
typeof pendingSyncChanges  // "boolean"
lastSyncAttempt      // número (timestamp)
```

---

## 📊 Teste 10: Validar Performance Overall

### Objetivo
Comparação geral de performance antes e depois

### Passos
1. Execute todos os testes acima
2. Preencha tabela abaixo
3. Compare com valores esperados

### Tabela de Resultados
```
┌─────────────────────┬────────────┬──────────────┬───────────┐
│ Métrica             │ Esperado   │ Obtido       │ Status    │
├─────────────────────┼────────────┼──────────────┼───────────┤
│ Tempo sync (ms)     │ 500-1500   │ _________    │ ___       │
│ Débounce funciona   │ SIM        │ _________    │ ___       │
│ Intervalo 2h        │ 120 min    │ _________    │ ___       │
│ Mínimo 5 min        │ 300000 ms  │ _________    │ ___       │
│ UI não bloqueia     │ SIM        │ _________    │ ___       │
│ requestIdleCallback │ SIM        │ _________    │ ___       │
│ Mudanças pendentes  │ SIM        │ _________    │ ___       │
│ Sem variáveis dup   │ SIM        │ _________    │ ___       │
│ Configs salvam      │ SIM        │ _________    │ ___       │
└─────────────────────┴────────────┴──────────────┴───────────┘
```

---

## 🐛 Troubleshooting

### Problema: "isSyncing is not defined"
```
✅ Solução: Variáveis estão no supabase-sync.js
✅ Verificar: Arquivo está sendo carregado antes de index.html
✅ Solução: Recarregar página (Ctrl+F5)
```

### Problema: Sincronização muito frequente
```
✅ Verificar: localStorage.getItem('syncFrequency')
✅ Esperar: Mínimo 5 minutos entre sincronizações automáticas
✅ Nota: Múltiplos salvamentos em 10s = 1 sync (débounce)
```

### Problema: Sincronização lenta (>2s)
```
✅ Verificar: Performance tab (DevTools)
✅ Verificar: Network tab (se há slow requests)
✅ Verificar: Supabase conectado e online
✅ Verificar: Quantidade de dados a sincronizar
```

### Problema: UI trava durante sync
```
✅ Verificar: Promise.all está sendo usado
✅ Verificar: requestIdleCallback está disponível
✅ Verificar: Nenhum await sequencial
✅ Verificar: Navegador suporta async/await
```

---

## ✅ Checklist de Validação Final

- [ ] Teste 1: Débounce funciona
- [ ] Teste 2: Intervalo mínimo 5 min respeitado
- [ ] Teste 3: Sincronização 5x mais rápida
- [ ] Teste 4: UI não bloqueia
- [ ] Teste 5: Background sync com requestIdleCallback
- [ ] Teste 6: Mudanças pendentes detectadas
- [ ] Teste 7: Intervalo de 2 horas configurado
- [ ] Teste 8: Configurações salvas em localStorage
- [ ] Teste 9: Sem variáveis duplicadas
- [ ] Teste 10: Performance overall OK

---

## 📝 Relatório de Teste

Após completar os testes, preencha:

```
Data do Teste: ___/___/_____
Navegador: ________________
Dispositivo: _______________

Testes Passados: ___ / 10
Testes Falhados: ___ / 10

Observações:
_________________________________
_________________________________
_________________________________

Assinado: __________________
```

---

**Duração Estimada**: 30-45 minutos
**Dificuldade**: Média (requer básico de DevTools)
**Recomendado**: Executar em Chrome/Firefox

Bom teste! 🚀

