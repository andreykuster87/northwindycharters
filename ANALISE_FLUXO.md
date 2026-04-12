# ANÁLISE DETALHADA DO FLUXO DE TRANSFORMAÇÃO DE PERFIL

## 1. PROBLEMA ATUAL

### Fluxo Atual (Incorreto)
```
Cliente (Client) 
    ↓
Clica "Fazer parte da comunidade"
    ↓
Preenche SailorApplicationModal (4 steps)
    ↓
Admin aprova em CandidatosTab
    ↓
approveSailorApplication() → CRIA UM NOVO SAILOR ❌
    ↓
Resultado: Dois perfis (1 Client + 1 Sailor) - DUPLICAÇÃO
```

### O que está acontecendo em `approveSailorApplication()` (linha 686):
1. ✅ Extrai dados da candidatura
2. ✅ Gera novo profile_number (linha 693-694)
3. ✅ Gera novo login/password (linha 695-697)
4. ❌ **INSERE um novo registro na tabela 'sailors'** (linha 749)
5. ✅ Marca candidatura como 'approved'
6. ✅ Envia mensagem de sucesso

### Consequência:
- Client original continua existindo
- Um novo Sailor é criado (com dados duplicados)
- Sem ligação clara entre os dois perfis

---

## 2. FLUXO DESEJADO

```
Cliente (Client) 
    ↓
Clica "Fazer parte da comunidade"
    ↓
Preenche SailorApplicationModal + CAMPOS NOVOS
  - Horário (data/hora atual)
  - Checkbox "Informações verdadeiras"
  - Checkbox "Aceito termos"
    ↓
Admin aprova em CandidatosTab
    ↓
TRANSFORMA o Client em Sailor
  (não cria novo, transforma o existente)
    ↓
Resultado: 1 perfil único (Client → Sailor)
```

---

## 3. ANÁLISE DO CADASTRO DE TRIPULANTE (SailorRegistration)

### Step 4 - Confirmação Final (Step4Medico.tsx)
No formulário de tripulante **novo**, o Step 4 tem:

```tsx
// Campos visíveis:
- declaracaoData: datetime (preenchido automaticamente com nowDatetimeLocal())
- aceitouTermos: boolean checkbox
- medicoValidade: date field
- aceitouMedico: boolean checkbox (se possui médico)

// Validação antes de submit (linha 155-156):
if (!declaracaoData) { showErr(...); return; }
if (!aceitouTermos) { showErr(...); return; }
```

Arquivo: `/project/src/components/sailor/steps/Step4Medico.tsx`

**O que precisa:**
1. Data/hora da declaração (auto-preenchida)
2. Checkbox: "Declaro que as informações acima são verdadeiras"
3. Checkbox: "Aceito os termos e condições"

---

## 4. ANÁLISE DO ESTADO DO TRIPULANTE

### Quando em Aprovação (pending):
- `status`: 'pending'
- `verified`: false
- `verified_at`: null
- `sailor_login`: null
- `sailor_password`: null

### Quando Aprovado:
- `status`: 'approved'
- `verified`: true
- `verified_at`: new Date().toISOString()
- `sailor_login`: generated (e.g., "joao#00001")
- `sailor_password`: generated (6 chars random)

---

## 5. ALTERAÇÕES NECESSÁRIAS

### A. Base de Dados (Schema)
Adicionar campos ao `clients` table:
```sql
ALTER TABLE clients ADD COLUMN IF NOT EXISTS:
- sailor_status: varchar (null | 'pending' | 'approved' | 'rejected')
- sailor_login: varchar (nullable)
- sailor_password: varchar (nullable)
- sailor_application_id: uuid (fk → sailor_applications.id)
- converted_to_sailor_at: timestamp (nullable)
```

### B. SailorApplicationModal.tsx
Adicionar Step 4 com:
- Data/hora (auto-preenchida)
- Checkbox "verdadeira"
- Checkbox "termos"

Exatamente como em Step4Medico.tsx

### C. localStore.ts - approveSailorApplication()
**Linha 686-771:**

**De:** Inserir novo Sailor
**Para:** Atualizar Client existente

```javascript
// ANTES (linha 749):
const { data: sailorRow2, error: sailorErr } = await supabase
  .from('sailors').insert(sailorRow).select().single();

// DEPOIS:
const { data: clientUpdated, error: clientErr } = await supabase
  .from('clients').update({
    sailor_status: 'approved',
    sailor_login: login,
    sailor_password: password,
    sailor_application_id: app.id,
    converted_to_sailor_at: new Date().toISOString(),
    // ... copiar dados de sailorRow para campos do client
  }).eq('id', app.client_id).select().single();
```

### D. CandidatosTab.tsx
Sem mudanças (o modal já funciona)

### E. Dossiê Admin
Quando abre dossiê de candidatura:
- Mostrar os campos finais adicionados (data, checkboxes)
- Confirmar que aceita termos antes de aprovar

---

## 6. DETALHES DE IMPLEMENTAÇÃO

### ClientRegistrationModal - Sem Alterações Necessárias
- Continua como está
- Client criado normalmente

### SailorApplicationModal - ADICIONAR STEP 4

**Antes:**
- Step 1: Dados do Client (read-only)
- Step 2: Função & Caderneta
- Step 3: Documentos
- **Falta Step 4**

**Depois:**
- Step 1: Dados do Client (read-only)
- Step 2: Função & Caderneta  
- Step 3: Documentos
- **Step 4: Confirmação (NOVO)** ← adicionar
  - Data/hora (auto-preenchida com `nowDatetimeLocal()`)
  - Checkbox "verdadeira"
  - Checkbox "termos"
  - Botão "Enviar Candidatura"

### approveSailorApplication() - LÓGICA CRÍTICA

**Transformação ao invés de Inserção:**
1. Extrair dados da candidatura ✅
2. Gerar credenciais (login/password) ✅
3. **Atualizar Client** (não inserir Sailor):
   ```
   clients.sailor_status = 'approved'
   clients.sailor_login = login
   clients.sailor_password = password
   clients.sailor_application_id = app.id
   clients.converted_to_sailor_at = now()
   clients.verified = true
   clients.verified_at = now()
   ... copiar dados de app para campos relevantes
   ```
4. Marcar candidatura como 'approved' ✅
5. Enviar mensagem com credenciais ✅

---

## 7. MAPEAMENTO DE DADOS (Client → Sailor)

Quando aprovado, o Client recebe:

| Campo do Sailor | Origem |
|---|---|
| sailor_login | Gerado (app.name + '#' + profileNum) |
| sailor_password | Gerado (6 chars) |
| sailor_status | 'approved' |
| verified | true |
| verified_at | now() |
| converted_to_sailor_at | now() |
| sailor_application_id | app.id |

Outros dados já existem no Client:
- name, email, phone, birth_date, country_name ✓

Novos dados vêm da Application:
- funcoes → funcao
- caderneta_maritima_numero → caderneta_numero
- doc_id_numero → passaporte_numero
- stcw, stcw_validades ✓
- medico_numero, medico_validade ✓
- experiencias, idiomas ✓

---

## 8. TESTES/VALIDAÇÃO

### Fluxo de Teste:
1. Criar novo Client (ClientRegistrationModal)
2. Client clica "Fazer parte da comunidade"
3. Preencher SailorApplicationModal (todos os steps + Step 4 novo)
4. Verificar dados salvos na candidatura
5. Admin abre dossiê e aprova
6. **Verificar:** Cliente original transformado (não novo sailor criado)
7. Cliente recebe credenciais (login/password) via mensagem

### Verificações:
- [ ] Cliente original existe com `sailor_status = 'approved'`
- [ ] Nenhum novo sailor foi criado
- [ ] `sailor_login` e `sailor_password` estão preenchidos
- [ ] Mensagem de boas-vindas enviada com credenciais
- [ ] Candidatura marcada como 'approved'

