# 🧠 Sistema Inteligente de Recomendações - Guia Completo

## 📋 Visão Geral

O Calm Mind agora possui um sistema inteligente que torna a interação mais humana, proativa e personalizada. O app analisa padrões comportamentais e oferece recomendações de exercícios, saudações dinâmicas e diálogos contextuais.

---

## 🎯 Funcionalidades Principais

### 1️⃣ **Recepção Dinâmica e Personalizada**

#### O que faz:
- Saudação contextual baseada na **hora do dia**
- Incorpora o **nome do usuário**
- Mostra **insights sobre o bem-estar atual**
- Exibe **último check-in e consecutivos**

#### Exemplos:
```
🌅 Bom dia, João!
✨ Que ótimo! Seu bem-estar está melhorando!
😊 Bem (Há 2h) | 🔥 Começando bem!
```

#### Componentes:
- Emoji contextual (🌅 manhã, ☀️ tarde, 🌆 noite, 🌙 madrugada)
- Mensagens motivacionais aleatórias
- Status de consistência (🏆 Master, ⭐ Excelente, ✨ Bom, 🔥 Iniciando)

---

### 2️⃣ **Sistema de Recomendações Inteligentes**

#### Recomendações Baseadas em:

**A) Tendência de Humor**
- 📈 Se melhorando → Mensagem motivacional
- 📉 Se piorando → Recomenda exercício urgente SOS
- ➡️ Se estável → Recomenda exercício de rotina

**B) Qualidade de Sono**
- 😴 Sono ruim → Recomenda "Respiração Box" antes de dormir
- 😐 Sono médio → Dicas de higiene do sono
- ✅ Sono bom → Reconhecimento positivo

**C) Padrão de Ansiedade**
- Detecta **horários pico** de ansiedade
- Oferece exercício **preventivo** 30 min antes
- Mostra **frequência semanal** de crises

**D) Consistência**
- Se < 3 dias → Motiva a manter o hábito
- Se 3-7 dias → Reconhece "Começando bem!"
- Se 7-14 dias → 🔥 "Semana consistente!"
- Se 14-30 dias → ⭐ "Sequência excelente!"
- Se > 30 dias → 🏆 "Você é um mestre!"

**E) Horário Ideal**
- Identifica melhor momento para exercícios
- Usa histórico de humor + hora para recomendar

#### Prioridades:
```
1️⃣ URGENTE (📍 Declínio de humor) → Modo SOS
2️⃣ IMPORTANTE (😴 Sono ruim) → Exercício relaxante
3️⃣ PREVENTIVA (⚠️ Pico de ansiedade) → Exercício proativo
4️⃣ MOTIVACIONAL (💪 Consistência baixa) → Encorajamento
5️⃣ ROUTINE (🧘 Horário ideal) → Exercício regular
```

---

### 3️⃣ **Check-in Interativo e Proativo**

#### Como Funciona:

1. **Pergunta Contextual**
   - Varia por hora do dia
   - **Manhã**: "Como você dormiu ontem?"
   - **Tarde**: "Como está seu dia até agora?"
   - **Noite**: "Como foi seu dia?"
   - **Madrugada**: "Como você se sente antes de dormir?"

2. **Seletor Visual de Humor**
   ```
   😰 😟 😐 😊 😄
   (Clique para responder)
   ```

3. **Notas Adicionais**
   - Campo de texto para contexto
   - Opcional mas recomendado

4. **Próximos Passos Inteligentes**
   - Ao submeter check-in, o app sugere ações baseadas na resposta
   - Diferentes sugestões por nível de ansiedade

---

### 4️⃣ **Análise Inteligente de Padrões**

#### Dados Analisados (últimos 30 dias):

| Métrica | O que detecta |
|---------|--------------|
| **Tendência de Humor** | Melhorando/Piorando/Estável |
| **Qualidade de Sono** | Média, Tendência, Status |
| **Padrão de Ansiedade** | Frequência, Picos horários, Severidade |
| **Melhor Horário** | Quando o exercício é mais efetivo |
| **Dias Úteis vs Fim de Semana** | Diferenças no bem-estar |
| **Gatilhos de Ansiedade** | Top 3 horários mais críticos |
| **Taxa de Recuperação** | Dias até voltar ao humor normal |
| **Frequência de Exercício** | Frequente/Moderado/Raramente |
| **Consistência** | Dias consecutivos de registros |

#### Exemplo de Análise:
```json
{
  "moodTrend": "improving",
  "sleepQuality": {
    "averageDuration": 7.2,
    "averageQuality": 3.8,
    "status": "good"
  },
  "anxietyPatterns": {
    "frequencyPerWeek": 1.5,
    "peakHour": 14,
    "triggerTimes": [14, 20, 8]
  },
  "bestTimeForExercises": 14,
  "consistencyScore": 12
}
```

---

## 🔧 Como Usar

### Ativação Automática

O sistema é ativado automaticamente ao:
1. Abrir o app
2. Clicar no botão "Dashboard"
3. Fazer login após sessão

### Componentes Renderizados

```
┌─────────────────────────────────┐
│  🌅 Bom dia, João!              │  ← Recepção personalizada
│  ✨ Seu bem-estar está melhorando│
├─────────────────────────────────┤
│  ❓ Como você está se sentindo?  │  ← Check-in interativo
│  😰 😟 😐 😊 😄                 │
├─────────────────────────────────┤
│  💡 Recomendações Personalizadas │  ← Sugestões inteligentes
│  • 📈 Seu humor está em declínio │
│  • 😴 Qualidade do sono em baixa │
├─────────────────────────────────┤
│  📈  😴  🧘  🔥                 │  ← Análise de padrões
│  Melhorando | Ótimo | Raramente │
└─────────────────────────────────┘
```

---

## 💡 Exemplos Práticos

### Cenário 1: Usuário com Ansiedade Crescente
```
Sistema detecta: 
- Humor declina há 3 dias
- Picos de ansiedade às 14h
- Sono de qualidade ruim

Recomendação:
🔴 URGENTE: "Seu humor está em declínio"
   Notamos mudança negativa detectada
   → Comece exercício SOS agora

⚠️ PREVENTIVA: "Hora de ansiedade detectada"
   Você costuma ficar ansioso(a) por volta das 14h
   → Começar exercício preventivo
```

### Cenário 2: Usuário Consistente
```
Sistema detecta:
- 15 dias de registros consecutivos
- Humor estável
- Pratica exercícios 4x por semana

Recomendação:
💪 MOTIVACIONAL: "Mantenha a consistência"
   ⭐ Sequência excelente!
   Você é um exemplo de dedicação
   → Continue assim!
```

### Cenário 3: Usuário Novo (Sem Dados)
```
Sistema oferece:
🧘 ROUTINE: "Bem-estar do dia"
   Que tal um exercício de respiração?
   → Começar exercício

📝 MOTIVACIONAL: "Registre seu dia"
   Seus registros nos ajudam a conhecer você melhor
   → Fazer check-in
```

---

## 📊 Dados Necessários

Para recomendações mais precisas, o sistema precisa de:

| Tipo | Mínimo | Ideal |
|------|--------|-------|
| Registros de humor | 3 | 30+ dias |
| Registros de sono | 3 | 14+ dias |
| Exercícios realizados | 1 | 10+ dias |
| Check-ins | 5 | 20+ dias |

**Nota**: Com menos dados, o sistema oferece recomendações padrão.

---

## 🎨 Customização

### Cores por Tipo de Recomendação

```css
.urgent       /* Vermelho - Situações críticas */
.important    /* Laranja - Importante mas não urgente */
.preventive   /* Amarelo - Prevenção */
.motivational /* Azul - Encorajamento */
.routine      /* Verde - Rotina */
```

### Modificar Frases

Edite em `smart-recommendations.js`:
```javascript
getMotivationalMessage() {
    const messages = [
        'Adicione suas frases aqui',
        'Mensagens inspiracionais',
        // ...
    ];
}
```

---

## 🐛 Troubleshooting

### Não vejo recomendações
- ✅ Verifique se tem dados suficientes (3+ registros)
- ✅ Limpe cache/localStorage
- ✅ Faça um check-in novo

### Check-in não funciona
- ✅ Selecione um emoji antes de enviar
- ✅ Verifique console para erros
- ✅ Reinicie o app

### Padrões não precisos
- ✅ Adicione mais dados (30 dias = análise perfeita)
- ✅ Seja consistente com registros
- ✅ Use notas descritivas

---

## 🚀 Próximas Melhorias

- [ ] IA/ML para detecção de padrões mais sofisticada
- [ ] Notificações push para alertas proativos
- [ ] Comparação com comunidade (anônima)
- [ ] Exportar relatórios PDF
- [ ] Integração com wearables (dados de sono)
- [ ] Análise de correlação gatilho-ansiedade
- [ ] Meditações guiadas personalizadas

---

## 📱 Estrutura de Arquivos

```
js/
├── smart-recommendations.js    # Motor de análise e recomendações
├── smart-ui-components.js      # Renderização de UI
├── supabase-sync.js            # Sincronização de dados
└── sync-ui-enhancements.js     # Melhorias de UI

index.html                       # Integração dos scripts
```

---

## 🔐 Privacidade

- ✅ Todos os dados são armazenados localmente (IndexedDB)
- ✅ Análise ocorre no navegador (sem enviar ao servidor)
- ✅ Sincronização com Supabase é opcional
- ✅ Sem coleta de dados pessoais além do necessário

---

## 📞 Suporte

Erros ou dúvidas? Verifique:
1. Console do navegador (F12)
2. localStorage limpo
3. Dados do IndexedDB
4. Conexão de internet

---

**Versão**: 1.0.0  
**Data**: Novembro 2025  
**Status**: ✅ Pronto para Produção
