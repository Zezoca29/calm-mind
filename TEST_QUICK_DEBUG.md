# 🧪 Teste Rápido do Sistema de Reflexão

## Se o Modal Não Aparece:

### 1️⃣ Abra o Console (F12 > Console)

### 2️⃣ Execute estes comandos na ordem:

```javascript
// Primeiro, ativar modo debug
enableReflectionDebug()

// Depois, tente chamar reflexão
checkReflectionMoments()

// Ou force uma reflexão específica
forceReflection('wakeUp')
```

### 3️⃣ Observe o Console

Você deve ver logs como:
```
✅ Modo de teste ativado!
Verificando condição para reflexão: wakeUp
✅ Modal exibido: wakeUp
```

## Se Ainda Não Aparecer:

1. Abra o **Developer Tools** (F12)
2. Vá para a aba **Console**
3. Copie e cole isto:

```javascript
// Testa se a função existe
typeof checkReflectionMoments
// Deve retornar: "function"

// Testa se pode forçar
forceReflection('wakeUp')
// Deve aparecer o modal
```

## ⚠️ Possíveis Problemas:

### "getAllFromStore is not defined"
- Significa que o IndexedDB não foi inicializado
- Atualize a página
- Verifique se está logado

### "showSection is not defined"
- A função de navegação não está disponível
- Recarregue a página

### Modal aparece, mas mensagem está vazia
- Isso é normal! O insight está sendo carregado
- Verifique o Console para erros

## 🎯 Teste Final

Se tudo funcionar, você deve ver:
1. ✅ Modal com fundo escuro
2. ✅ Título em grande (emoji + texto)
3. ✅ Mensagem principal
4. ✅ Insight personalizado (💡)
5. ✅ 3 botões (Ação, Adiar, Fechar)
6. ✅ Barra de progresso do dia

---

**Compartilhe o log do console se precisar de ajuda!**
