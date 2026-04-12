# RESUMO EXECUTIVO - TRANSFORMAÇÃO DE PERFIL

## 🎯 OBJETIVO
Quando um **Passageiro** é aprovado como **Tripulante**, o sistema deve **transformar seu perfil existente** em um perfil de tripulante, ao invés de criar um novo perfil.

---

## 📊 ANTES vs DEPOIS

### ❌ ANTES (Problema)
```
Cliente "João Silva"
├── ID: abc-123
├── Email: joao@email.com
├── Tipo: Passageiro
└── [Candidatura aprovada]
    └── Cria NOVO Sailor
        ├── ID: def-456 (diferente!)
        ├── Email: joao@email.com (duplicado)
        └── Tipo: Tripulante

Resultado: 2 perfis separados ❌
```

### ✅ DEPOIS (Solução)
```
Cliente "João Silva"
├── ID: abc-123
├── Email: joao@email.com
├── Tipo: Passageiro → Tripulante (TRANSFORMADO)
├── sailor_status: 'approved'
├── sailor_login: 'joao#00001'
├── sailor_password: 'ABC123'
└── converted_to_sailor_at: 2026-04-11T15:30

Resultado: 1 perfil único ✅
```

---

## 🔄 FLUXO VISUAL

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Passageiro cria conta                                    │
│    → Salva em 'clients' table                               │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Passageiro clica "Fazer parte da comunidade"             │
│    → Abre SailorApplicationModal                            │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Preenche candidatura (4 STEPS)                           │
│    Step 1: Dados pessoais (read-only)                       │
│    Step 2: Função & Caderneta Marítima                      │
│    Step 3: Documentos (ID, Carta, STCW, Médico)             │
│    Step 4: ⭐ NOVO → Confirmação                            │
│       ├── Data/hora (auto-preenchida)                       │
│       ├── Checkbox: "Informações verdadeiras"               │
│       └── Checkbox: "Aceito termos"                         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Admin analisa no CandidatosTab                           │
│    → Aprova candidatura                                     │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. ⭐ TRANSFORMAÇÃO (NÃO CRIAÇÃO)                           │
│    UPDATE clients SET                                       │
│      sailor_status = 'approved'                             │
│      sailor_login = 'joao#00001'                            │
│      sailor_password = 'ABC123'                             │
│      converted_to_sailor_at = NOW()                         │
│    WHERE id = abc-123                                       │
│                                                              │
│    → Cliente original transformado em tripulante            │
│    → SEM criar novo sailor                                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Cliente recebe credenciais                               │
│    → Mensagem WhatsApp com login/password                   │
│    → Pode acessar área de tripulante                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 TAREFAS ESPECÍFICAS

### FASE 1: Schema
- [ ] Adicionar 4 colunas ao `clients`:
  - `sailor_status` (null | 'pending' | 'approved' | 'rejected')
  - `sailor_login`
  - `sailor_password`
  - `sailor_application_id`

### FASE 2: Frontend - SailorApplicationModal
- [ ] **Step 4 NOVO:** Confirmação
  - [ ] Renderizar após Step 3
  - [ ] Auto-preencher data (usar `nowDatetimeLocal()`)
  - [ ] 2 checkboxes (verdade + termos)
  - [ ] Botão "Enviar"
- [ ] Atualizar `saveSailorApplication()` para enviar:
  - `declaracao_data`
  - `declara_verdade`
  - `aceita_termos`

### FASE 3: Backend - localStore
- [ ] Atualizar type `SailorApplication` com 3 novos campos
- [ ] **Refatorar `approveSailorApplication()`:**
  - ❌ Remover: `INSERT INTO sailors`
  - ✅ Adicionar: `UPDATE clients SET sailor_*`
  - ✅ Manter: Geração de credenciais
  - ✅ Manter: Mensagem de sucesso

### FASE 4: Admin - CandidatosTab
- [ ] Mostrar no dossiê:
  - Data da declaração
  - Status dos checkboxes

### FASE 5: Testes
- [ ] Fluxo completo (client → candidatura → aprovação → transformação)
- [ ] Verificação: Nenhum novo sailor criado
- [ ] Verificação: Cliente original transformado
- [ ] Verificação: Credenciais geradas e enviadas

---

## 🔑 PONTOS CRÍTICOS

### 1. **REMOVER inserção em sailors**
   - **Linha 749:** `INSERT INTO sailors` ← REMOVER
   - **Substituir por:** `UPDATE clients SET sailor_*` ← ADICIONAR

### 2. **Manter compatibilidade**
   - Campos novos no schema devem ter `DEFAULT NULL`
   - `approveSailorApplication()` deve funcionar com apps antigos

### 3. **Step 4 é obrigatório**
   - Não pode pular sem marcar checkboxes
   - Data deve ser auto-preenchida

### 4. **Mensagens corretas**
   - Mudar "Bem-vindo(a) como novo tripulante"
   - Para "Sua transformação para tripulante foi aprovada"

---

## ✅ VALIDAÇÃO FINAL

Após implementar, verificar:

```
SELECT * FROM clients WHERE sailor_status = 'approved';
```

Deve retornar:
- ✅ `sailor_login` preenchido (e.g., "joao#00001")
- ✅ `sailor_password` preenchido (6 chars)
- ✅ `converted_to_sailor_at` preenchido
- ✅ `sailor_application_id` referencia app correto

```
SELECT * FROM sailors;
```

Deve retornar:
- ✅ Nenhum novo sailor foi criado (tabela vazia ou sem apps aprovadas recentes)

---

## 📝 NOTAS

1. **Não é uma mudança destrutiva**
   - Clients existentes não são afetados
   - Apps antigas continuam funcionando (campos opcionais)

2. **Reversibilidade**
   - Se necessário, pode-se "voltar" um cliente com `UPDATE clients SET sailor_status = NULL`
   - Histórico preservado em `converted_to_sailor_at` e `sailor_application_id`

3. **Performance**
   - UPDATE é mais rápido que INSERT
   - Não há duplicação de dados
   - Menos consultas ao salvar/autorizar

4. **Auditoria**
   - Campo `sailor_application_id` permite rastrear origem da transformação
   - Campo `converted_to_sailor_at` marca quando ocorreu

