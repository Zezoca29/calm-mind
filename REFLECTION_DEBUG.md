# Sistema de Reflexão - Guia de Debug

## Como Testar o Sistema de Momentos de Reflexão

### Opção 1: Usar o Botão de Teste (Interface)
1. Abra a aplicação e vá para o Dashboard
2. Clique no botão **"🧪 Testar Sistema de Reflexão"** (em azul)
3. O modal de reflexão será exibido

### Opção 2: Usar o Console do Navegador (Mais Controle)

#### Ativar Modo de Teste
```javascript
enableReflectionDebug()
// Resultado: Modo de teste ativado!
```

#### Testar Reflexão Automática
```javascript
checkReflectionMoments()
// Vai exibir a primeira reflexão disponível
```

#### Forçar Reflexão Específica
```javascript
// Mostrar reflexão específica:
forceReflection('wakeUp')      // Acordar (5:30)
forceReflection('midMorning')  // Meio da manhã (7:30)
forceReflection('midDay')      // Meio do dia (10:00)
forceReflection('afternoon')   // Tarde (15:00)
forceReflection('evening')     // Transição (18:00)
forceReflection('night')       // Noite (21:00)
forceReflection('lateNight')   // Madrugada (23:30)
```

#### Limpar Cache de Teste
```javascript
clearReflectionTests()
// Limpa o localStorage para poder testar múltiplas vezes
```

#### Desativar Modo de Teste
```javascript
disableReflectionDebug()
```

## Horários Automáticos (Produção)

O sistema verifica automaticamente a cada 5 minutos (entre 5:30 e 00:00):

- **05:30** - ☀️ Acordar (registrar sono)
- **07:30** - 🌱 Meio da manhã (check-in de humor)
- **10:00** - 🌊 Meio do dia (pausa para respirar)
- **15:00** - 🌤️ Tarde (check-in de energia)
- **18:00** - 🌅 Transição (exercício de respiração)
- **21:00** - 🌙 Noite (escrever no diário)
- **23:30** - ✨ Madrugada (check-in final antes de dormir)

**Nota:** 
- Reflexões **SÓ APARECEM** entre **5:30 e 00:00** (meia-noite)
- Cada reflexão mostra apenas uma vez por dia
- Há um cooldown de 4 horas entre elas

## Possíveis Problemas

### 1. Modal não aparece ao clicar no botão
- Abra o console (F12 > Console)
- Execute: `checkReflectionMoments()`
- Verifique as mensagens de log

### 2. "Reflexões fora do horário"
- Este é o comportamento esperado fora de 5:30 - 00:00
- Use `enableReflectionDebug()` para ignorar a validação de horário

### 3. Erro "getAllFromStore is not defined"
- Certifique-se de que a função de IndexedDB foi carregada
- Verifique se o banco de dados foi inicializado

### 4. Reflexão não segue a condição
- Cada reflexão tem uma condição específica (ex: só mostra se ainda não registrou sono hoje)
- Em modo debug, use `forceReflection()` para ignorar condições

## Estrutura de uma Reflexão

```javascript
{
  time: { hour: 5, minute: 30 },           // Horário de exibição
  title: "☀️ Acordar!",                     // Título com emoji
  message: "Como você dormiu?",            // Mensagem principal
  action: "Registrar Sono",                // Texto do botão de ação
  section: "sleep",                        // Seção para navegar
  condition: async () => { ... }           // Função que valida se deve mostrar
}
```

## Logs no Console

Quando em debug mode, você verá logs como:
```
✅ Modo de teste ativado!
Verificando condição para reflexão: wakeUp
Mostrando reflexão: wakeUp
```

### Verificação de Horário
Se estiver fora do período de 5:30 - 00:00, verá:
```
Reflexões fora do horário. Horário de exibição: 5:30 - 00:00. Agora: 2:45
```

---

**Dica:** Abra o Developer Tools (F12) e mantenha a aba Console aberta para acompanhar os logs enquanto testa!
