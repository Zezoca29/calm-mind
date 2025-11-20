# 🧠 Sistema Inteligente - Visão Geral Visual

## 📊 Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    CALM MIND APP                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐        ┌──────────────────┐     │
│  │   Index.html     │        │  Smart System    │     │
│  │  (Interface)     │───────▶│   Integration    │     │
│  └──────────────────┘        └──────────────────┘     │
│                                      ▲                │
│           ┌────────────────────────┬─┴─┬─────────┐   │
│           │                        │   │         │   │
│           ▼                        ▼   ▼         ▼   │
│  ┌──────────────────┐    ┌──────────────┐   ┌────┐ │
│  │ IndexedDB        │    │  Smart       │   │UI  │ │
│  │ - moodEntries   │◀───│Recommend.    │   │Comp│ │
│  │ - sleepEntries  │    │ Engine       │───▶│onts│ │
│  │ - breathing     │    │              │   │    │ │
│  │ - diary         │    └──────────────┘   └────┘ │
│  └──────────────────┘           ▲                  │
│           ▲                      │                  │
│           │                      │                  │
│  ┌────────┴──────────┐    ┌──────┴───────────┐    │
│  │  Supabase Cloud   │    │ Browser Console  │    │
│  │  (Sync Optional)  │    │ (Debugging)      │    │
│  └───────────────────┘    └──────────────────┘    │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Funcionamento

```
USUÁRIO ABRE O APP
         │
         ▼
┌─────────────────────────┐
│ 1. Carregar Dados       │
│    do IndexedDB         │
│    (30 dias)            │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 2. Smart Engine Analisa Padrões     │
│    • Tendência humor                │
│    • Qualidade sono                 │
│    • Padrões ansiedade              │
│    • Horários gatilho               │
│    • Taxa recuperação               │
│    • Score consistência             │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 3. Gerar Recomendações Priorizadas  │
│    1. Urgente (Crítico)             │
│    2. Importante (Alto)             │
│    3. Preventiva (Médio)            │
│    4. Motivacional (Baixo)          │
│    5. Routine (Info)                │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 4. Renderizar UI Components         │
│    • Recepção personalizada         │
│    • Check-in interativo            │
│    • Recomendações visuais          │
│    • Análise de padrões             │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 5. Usuário Interage                 │
│    • Faz check-in                   │
│    • Clica em recomendação          │
│    • Inicia exercício               │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 6. Mostrar Próximos Passos          │
│    • SOS (urgente)                  │
│    • Box breathing (relaxar)        │
│    • Ancoragem (presente)           │
│    • Comunidade (suporte)           │
│    • Diário (reflexão)              │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 7. Salvar Novo Dados                │
│    • Novo registro de humor         │
│    • Timestamp e contexto           │
│    • Feedback do exercício          │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 8. Sincronizar (Opcional)           │
│    • Upload para Supabase           │
│    • Backup na nuvem                │
│    • Backup em múltiplos dispositivos
└─────────────────────────────────────┘
```

---

## 📱 Interface Visual

### Estado 1: Recepção Personalizada
```
┌──────────────────────────────────┐
│ 🌅 Bom dia, João!               │  ◀ Emoji hora
│ ✨ Que ótimo! Seu bem-estar      │  ◀ Insight
│    está melhorando!              │
│                                  │
│ 😊 Bem (Há 2h)                  │  ◀ Mood status
│ 🔥 Começando bem!               │  ◀ Badge
└──────────────────────────────────┘
```

### Estado 2: Check-in Interativo
```
┌──────────────────────────────────┐
│ ❓ Como você está se sentindo?   │
│                                  │
│   😰  😟  😐  😊  😄            │  ◀ Seletor visual
│  (1)  (2) (3) (4) (5)           │
│                                  │
│ [Notas opcionais...]            │  ◀ Textarea
│                                  │
│ [Enviar Check-in] ▶            │  ◀ CTA
└──────────────────────────────────┘
```

### Estado 3: Recomendações
```
┌──────────────────────────────────┐
│ 💡 Recomendações                │
│                                  │
│ ┌────────────────────────────┐  │
│ │ 📈 Humor em declínio        │  │ ◀ Urgente
│ │ Notamos mudança negativa    │  │    (vermelho)
│ │ [Comece SOS agora →]        │  │
│ └────────────────────────────┘  │
│                                  │
│ ┌────────────────────────────┐  │
│ │ 😴 Sono em baixa            │  │ ◀ Importante
│ │ Qualidade: 2.3/5            │  │    (laranja)
│ │ [Exercício relaxante →]     │  │
│ └────────────────────────────┘  │
│                                  │
│ ┌────────────────────────────┐  │
│ │ ⚠️  Pico de ansiedade         │  │ ◀ Preventiva
│ │ Às 14h você fica ansioso    │  │    (amarelo)
│ │ [Iniciar exercício →]       │  │
│ └────────────────────────────┘  │
└──────────────────────────────────┘
```

### Estado 4: Análise de Padrões
```
┌───────────────────────────────┐
│  📈    😴    🧘    🔥        │  ◀ Cards
│  Melh.  Ótimo  Rara  15d    │
└───────────────────────────────┘
```

### Estado 5: Próximos Passos Modal
```
┌────────────────────────────────────┐
│ 🎯 Próximos Passos                │
│                                    │
│ 🆘 Modo SOS - Respiração Emergência│
│    Vamos acalmar você já           │
│                                    │
│ 🧘 Técnica 5-4-3-2-1              │
│    Trazer você de volta ao presente│
│                                    │
│ 📔 Escrever no Diário             │
│    Expressar seus sentimentos      │
│                                    │
│ 👥 Comunidade de Apoio            │
│    Conectar com psicólogos         │
│                                    │
│ [Fechar]                          │
└────────────────────────────────────┘
```

---

## 🎯 Decisões Inteligentes por Cenário

### Cenário 1: Novo Usuário
```
Dados: Insuficientes
         ▼
Ação: Recomendações padrão
         ▼
Resultado:
- Saudação genérica
- Exercício 'simple'
- Encorajamento a registrar
```

### Cenário 2: Usuário com Declínio
```
Dados: 
- Humor caindo há 3 dias
- Ansiedade aumentando
- Sono ruim
         ▼
Ação: Recomendação URGENTE
         ▼
Resultado:
🔴 PRIORIDADE 1: Modo SOS
Mensagem: "Detectamos declínio"
Exercício: Respiração de emergência
```

### Cenário 3: Usuário Consistente
```
Dados:
- 20 dias de registros
- Humor estável
- 4 exercícios/semana
         ▼
Ação: Recomendação ROUTINE
         ▼
Resultado:
🧘 PRIORIDADE 5: Exercício diário
Mensagem: "Hora ideal: 14h"
Badge: ⭐ Sequência excelente!
```

### Cenário 4: Padrão de Pico
```
Dados:
- Ansiedade sempre às 14h
- 3 picos/semana
         ▼
Ação: Recomendação PREVENTIVA
         ▼
Resultado:
⚠️ PRIORIDADE 3: Exercício preventivo
Mensagem: "Preparar-se 30 min antes"
Sugestão: "Comece às 13:30h"
```

---

## 📊 Dados Utilizados

### Entrada de Dados
```
Diários (diário):
├── Date
├── Title
├── Content
└── Tags

Humor (mood):
├── Date
├── Mood (1-5)
├── Anxiety_level (1-10)
└── Notes

Sono (sleep):
├── Date
├── Sleep_time
├── Wake_time
├── Duration
├── Quality (1-5)
└── Notes

Exercícios (breathing):
├── Date
├── Type (478/box/simple)
├── Duration
└── Effectiveness
```

### Processamento
```
SmartEngine
├── Analisa últimos 30 dias
├── Calcula médias
├── Detecta tendências
├── Identifica padrões
├── Prioriza recomendações
└── Gera insights
```

### Saída de UI
```
Components
├── renderSmartGreeting()
├── renderInteractiveCheckIn()
├── renderSmartRecommendations()
└── renderPatternsAnalysis()
```

---

## ⚡ Performance

### Tempos de Carregamento
```
Carregamento: ~300ms
├── 0ms:   Saudação renderizada
├── 100ms: Check-in renderizado
├── 200ms: Recomendações renderizadas
└── 300ms: Análise renderizada
```

### Recursos
```
CPU: ~5-10% durante análise
RAM: ~2-5MB para dados
Storage: ~100KB IndexedDB (30 dias)
Network: Opcional (Supabase)
```

### Otimizações
- ✅ Análise assíncrona
- ✅ Renderização em cascata
- ✅ Cache de dados locais
- ✅ Queries otimizadas
- ✅ Sem bloqueio de UI

---

## 🔐 Privacidade & Segurança

```
Dados do Usuário
       │
       ├─▶ IndexedDB (Local)
       │   └─ Criptografado no disco
       │
       ├─▶ Análise (Local)
       │   └─ Processada no navegador
       │
       └─▶ Supabase (Opcional)
           └─ Apenas se usuário ativar sync
```

---

## 📈 Métricas de Sucesso

### Engajamento
- [ ] Aumentar retenção em 40%
- [ ] +60% em consistência diária
- [ ] +50% em exercícios realizados

### Satisfação
- [ ] NPS > 60
- [ ] Taxa de completude > 80%
- [ ] Feedback positivo

### Saúde Mental
- [ ] ↑ Humor geral
- [ ] ↓ Crises de ansiedade
- [ ] ↑ Qualidade de sono

---

## 🚀 Próximas Fases

### Fase 2: IA Avançada
- Machine Learning para padrões
- Previsão de crises
- Recomendações ainda mais personalizadas

### Fase 3: Social
- Compartilhar vitórias anônimas
- Comparação com comunidade
- Suporte entre pares

### Fase 4: Integração
- Apple Health sync
- Google Fit sync
- Smartwatch data
- Spotify mood tracking

---

## 📞 Suporte Técnico

### Debug Console
```javascript
// No console (F12):

// Ver análise:
await exemploAnalise();

// Ver recomendações:
await exemploRecomendacoes();

// Ver dados:
await listarDados();

// Gerar relatório:
await gerarRelatorioDiario();
```

### Logs Importantes
```
✅ Análise bem-sucedida
⚠️ Dados insuficientes
❌ Erro ao processar
📊 X registros encontrados
🎯 Recomendação gerada
```

---

## 📚 Referências Rápidas

| Função | Localização | Uso |
|--------|------------|-----|
| `analyzePatterns()` | smart-recommendations.js | Analisa padrões |
| `generateRecommendations()` | smart-recommendations.js | Cria sugestões |
| `generateGreeting()` | smart-recommendations.js | Saudação |
| `renderSmartGreeting()` | smart-ui-components.js | Mostra recepção |
| `renderInteractiveCheckIn()` | smart-ui-components.js | Mostra check-in |
| `submitCheckIn()` | smart-ui-components.js | Processa check-in |
| `updateDashboard()` | index.html | Atualiza tudo |

---

**Sistema Inteligente do Calm Mind v1.0**  
**Status**: ✅ Pronto para Produção  
**Última Atualização**: Novembro 2025
