# PLANO DE EXECUÇÃO - Transformação de Perfil (Client → Sailor)

## RESUMO EXECUTIVO
Transformar o fluxo de aprovação de candidatura para **transformar um Client em Sailor** ao invés de criar um novo perfil. Isso elimina duplicação e mantém a continuidade da conta do passageiro.

**Arquivos a modificar: 5**
**Estimativa de complexidade: Média**

---

## FASE 1: PREPARAÇÃO (Schema/Tipos)

### Tarefa 1.1 - Atualizar schema do Client
**Arquivo:** Arquivo de migração (ou schema comentado)

**O que fazer:**
```sql
-- Adicionar colunas ao 'clients' table para suportar transformação em sailor
ALTER TABLE clients ADD COLUMN IF NOT EXISTS (
  sailor_status VARCHAR DEFAULT NULL,  -- null | 'pending' | 'approved' | 'rejected'
  sailor_login VARCHAR DEFAULT NULL,
  sailor_password VARCHAR DEFAULT NULL,
  sailor_application_id UUID DEFAULT NULL,
  converted_to_sailor_at TIMESTAMP DEFAULT NULL
);

-- Criar índice para buscar clients por sailor_application_id
CREATE INDEX IF NOT EXISTS idx_clients_sailor_application_id 
ON clients(sailor_application_id);
```

**Verificação:**
- [ ] Schema atualizado com os 4 novos campos

---

## FASE 2: FRONTEND - SailorApplicationModal

### Tarefa 2.1 - Adicionar Step 4 ao SailorApplicationModal
**Arquivo:** `/project/src/components/modals/SailorApplicationModal.tsx`

**O que fazer:**

1. **Linhas 18-24:** Atualizar STEP_LABELS para incluir Step 4:
```typescript
const STEP_LABELS = [
  { n: 1 as const, icon: '👤', short: 'Perfil',     label: 'Seus Dados'        },
  { n: 2 as const, icon: '⚓', short: 'Função',     label: 'Função & Caderneta' },
  { n: 3 as const, icon: '🪪', short: 'Docs',       label: 'Documentos'        },
  { n: 4 as const, icon: '✅', short: 'Confirmar',  label: 'Confirmação'       }, // ← NOVO
];
```

2. **Linhas 80-84:** Adicionar estado para Step 4:
```typescript
const [step, setStep] = useState<AppStep>(1);
const [done, setDone] = useState<Set<number>>(new Set());
// ... estados existentes ...

// ↓ ADICIONAR:
const [declaracaoData, setDeclaracaoData] = useState('');
const [declaraVerdade, setDeclaraVerdade] = useState(false);
const [aceitaTermos, setAceitaTermos] = useState(false);
```

3. **Após linha 150:** Adicionar função de auto-preenchimento de data (como em SailorRegistration):
```typescript
import { useEffect } from 'react';

// Dentro do componente, após outras variáveis:
useEffect(() => {
  if (step === 4 && !declaracaoData) {
    setDeclaracaoData(nowDatetimeLocal());
  }
}, [step]);

// Copiar função de SailorRegistration:
function nowDatetimeLocal() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}
```

4. **Validação canGoNext() - linha ~160:** Atualizar:
```typescript
function canGoNext(): boolean {
  if (step === 2) {
    return funcoes.length > 0 && cadernetaNumero.trim().length > 0 && cadernetaValidade.length === 10;
  }
  if (step === 3) {
    // ... lógica existente ...
  }
  if (step === 4) {  // ← ADICIONAR
    return declaraVerdade && aceitaTermos;
  }
  return true;
}
```

5. **Renderização - após linha 420:** Adicionar renderização do Step 4:
```typescript
{/* ── STEP 4: Confirmação ── */}
{step === 4 && (
  <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
    
    {/* Resumo dos dados */}
    <div className="bg-blue-50 border-2 border-blue-100 rounded-[22px] p-5 space-y-3">
      <p className="text-[10px] font-black text-blue-900 uppercase tracking-wide mb-3">✅ Resumo da Candidatura</p>
      <div className="space-y-2">
        <div className="flex justify-between items-center py-2">
          <span className="text-[10px] font-black text-blue-400 uppercase">Função(ões)</span>
          <span className="text-xs font-bold text-blue-900">{funcoes.join(', ')}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-t border-blue-100">
          <span className="text-[10px] font-black text-blue-400 uppercase">Caderneta</span>
          <span className="text-xs font-bold text-blue-900">{cadernetaNumero} (válido até {cadernetaValidade})</span>
        </div>
      </div>
    </div>

    {/* Data da declaração */}
    <div>
      <label className={LABEL}>Data & Hora da Declaração *</label>
      <input
        type="datetime-local"
        value={declaracaoData}
        onChange={e => setDeclaracaoData(e.target.value)}
        className="w-full bg-gray-50 border-2 border-gray-100 rounded-[18px] py-4 px-5 font-bold text-blue-900 focus:border-blue-900 outline-none transition-all text-sm"
      />
    </div>

    {/* Checkbox 1: Verdade */}
    <label className="flex items-start gap-3 cursor-pointer p-4 bg-gray-50 border-2 border-gray-100 rounded-[18px] hover:border-blue-300 transition-all">
      <input
        type="checkbox"
        checked={declaraVerdade}
        onChange={e => setDeclaraVerdade(e.target.checked)}
        className="w-5 h-5 rounded-md border-2 border-gray-300 bg-white cursor-pointer mt-0.5 flex-shrink-0"
      />
      <span className="text-sm font-bold text-blue-900 leading-relaxed">
        Declaro que todas as informações fornecidas acima são verdadeiras e completas, sob responsabilidade pessoal.
      </span>
    </label>

    {/* Checkbox 2: Termos */}
    <label className="flex items-start gap-3 cursor-pointer p-4 bg-gray-50 border-2 border-gray-100 rounded-[18px] hover:border-blue-300 transition-all">
      <input
        type="checkbox"
        checked={aceitaTermos}
        onChange={e => setAceitaTermos(e.target.checked)}
        className="w-5 h-5 rounded-md border-2 border-gray-300 bg-white cursor-pointer mt-0.5 flex-shrink-0"
      />
      <span className="text-sm font-bold text-blue-900 leading-relaxed">
        Aceito os termos e condições da plataforma NorthWindy Charters e declaro ter lido a política de privacidade.
      </span>
    </label>

    {/* Informação */}
    <div className="bg-amber-50 border-2 border-amber-100 rounded-[18px] px-5 py-4 flex items-start gap-3">
      <span className="text-lg flex-shrink-0">ℹ️</span>
      <div>
        <p className="font-black text-amber-800 text-sm">Próximas etapas</p>
        <p className="text-xs text-amber-700 font-bold mt-0.5 leading-relaxed">
          Após enviar, a equipa de administração analisará sua documentação. Você receberá as credenciais de acesso via WhatsApp em breve.
        </p>
      </div>
    </div>

    {/* Botões */}
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={goBack}
        className="px-6 py-5 border-2 border-gray-100 text-gray-400 rounded-[30px] font-black text-sm uppercase hover:border-blue-900 hover:text-blue-900 transition-all">
        ← Voltar
      </button>
      <button type="button" onClick={handleSubmit} disabled={loading || !canGoNext()}
        className="flex-1 bg-blue-900 text-white py-5 rounded-[30px] font-black uppercase tracking-widest text-base hover:bg-blue-800 shadow-xl transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
        {loading
          ? <span className="animate-pulse">Enviando...</span>
          : <><CheckCircle2 className="w-5 h-5 text-green-400" /> Enviar Candidatura</>}
      </button>
    </div>
  </div>
)}
```

6. **Atualizar handleSubmit() - linha ~182:**
   - Adicionar validação para `declaracaoData` e `aceitaTermos`
   - Passar esses valores ao `saveSailorApplication()`

```typescript
async function handleSubmit() {
  if (!canGoNext()) return;
  
  // Validações
  if (!declaracaoData) { setError('Preencha a data da declaração.'); scrollTop(); return; }
  if (!declaraVerdade) { setError('Declare que as informações são verdadeiras.'); scrollTop(); return; }
  if (!aceitaTermos) { setError('Aceite os termos e condições.'); scrollTop(); return; }
  
  setLoading(true);
  setError(null);
  try {
    // ... uploads de documentos ...
    
    await saveSailorApplication({
      // ... dados existentes ...
      declaracao_data: declaracaoData,  // ← ADICIONAR
      declara_verdade: declaraVerdade,  // ← ADICIONAR
      aceita_termos: aceitaTermos,      // ← ADICIONAR
    });

    setSubmitted(true);
  } catch (e: any) {
    setError(e.message || 'Erro ao enviar candidatura. Tente novamente.');
    scrollTop();
  } finally {
    setLoading(false);
  }
}
```

**Verificação:**
- [ ] Step 4 renderiza quando `step === 4`
- [ ] Data é auto-preenchida ao entrar em Step 4
- [ ] Ambos checkboxes precisam estar marcados para avançar
- [ ] Dados são enviados ao `saveSailorApplication()`

---

## FASE 3: BACKEND - localStore

### Tarefa 3.1 - Atualizar SailorApplication type
**Arquivo:** `/project/src/lib/store/sailor-applications.ts`

**O que fazer:**
```typescript
// Adicionar campos ao tipo SailorApplication:
export interface SailorApplication {
  // ... campos existentes ...
  declaracao_data?: string;      // ← NOVO
  declara_verdade?: boolean;     // ← NOVO
  aceita_termos?: boolean;       // ← NOVO
}
```

**Verificação:**
- [ ] Type atualizado

---

### Tarefa 3.2 - Refatorar approveSailorApplication()
**Arquivo:** `/project/src/lib/localStore.ts` (linhas 686-771)

**O que fazer:**

1. **Remover lógica de insert para sailors**
2. **Adicionar lógica de update para clients**

```typescript
export async function approveSailorApplication(
  applicationId: string
): Promise<{ client: Client; login: string; password: string }> {
  const app = cache.sailorApplications.find(a => a.id === applicationId);
  if (!app) throw new Error('Application not found');
  const client = cache.clients.find(c => c.id === app.client_id);
  if (!client) throw new Error('Client not found');

  // 1. Generate credentials
  const { data: cnt } = await supabase.rpc('next_counter', { counter_key: 'profile_counter' });
  const profileNum = String(cnt).padStart(5, '0');
  const login = app.name.split(' ')[0].toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '') + '#' + String(parseInt(profileNum, 10));
  const password = Math.random().toString(36).substring(2, 8).toUpperCase();

  // 2. UPDATE CLIENT (transform to sailor)
  const clientUpdate: any = {
    sailor_status: 'approved',
    sailor_login: login,
    sailor_password: password,
    sailor_application_id: app.id,
    converted_to_sailor_at: new Date().toISOString(),
    verified: true,
    verified_at: new Date().toISOString(),
    
    // Copy data from application to client
    funcao: app.funcoes.join(', '),
    caderneta_numero: app.caderneta_maritima_numero,
    caderneta_validade: toIsoDate(app.caderneta_maritima_validade),
    passaporte_numero: app.doc_id_numero ?? null,
    passaporte_tipo: app.doc_id_tipo ?? null,
    passaporte_validade: toIsoDate(app.doc_id_validade),
    stcw: app.stcw ?? {},
    stcw_validades: app.stcw_validades ?? {},
    medico_numero: app.medico_numero ?? null,
    medico_validade: toIsoDate(app.medico_validade),
    experiencias: app.experiencias ?? [],
    idiomas: app.idiomas ?? [],
    cursos_relevantes: app.cursos_relevantes ?? null,
    experiencia_embarcado: app.experiencia_embarcado ?? false,
  };

  const { data: clientUpdated, error: clientErr } = await supabase
    .from('clients').update(clientUpdate).eq('id', app.client_id).select().single();
  if (clientErr) throw clientErr;
  
  // Update cache
  const updatedClient = { ...client, ...clientUpdated };
  cache.clients = cache.clients.map(c => c.id === app.client_id ? updatedClient : c);

  // 3. Update application status
  const patch = { status: 'approved', approved_at: new Date().toISOString() };
  await supabase.from('sailor_applications').update(patch).eq('id', applicationId);
  cache.sailorApplications = cache.sailorApplications.map(a =>
    a.id === applicationId ? { ...a, ...patch } : a
  );

  // 4. Send welcome message
  await sendSystemMessage({
    client_id: app.client_id,
    type: 'welcome',
    title: '⚓ Candidatura Aprovada — Bem-vindo(a) à Tripulação!',
    body: `Parabéns, ${app.name.split(' ')[0]}! Sua transformação para tripulante foi aprovada.\n\n🔑 *Credenciais de Acesso:*\nLogin: ${login}\nSenha: ${password}\n\nAcesse com as credenciais acima na área do profissional.`,
    meta: {},
  });

  return { client: updatedClient, login, password };
}
```

**Verificação:**
- [ ] Nenhuma inserção na tabela 'sailors'
- [ ] Client original é atualizado com `sailor_status = 'approved'`
- [ ] Credenciais são geradas e salvos no client
- [ ] Mensagem de boas-vindas inclui nova formulação

---

## FASE 4: ADMIN - CandidatosTab (Visualização)

### Tarefa 4.1 - Adicionar campos finais ao dossiê
**Arquivo:** `/project/src/components/admin/tabs/CandidatosTab.tsx`

**O que fazer:**
- No DossierModal, adicionar seção final mostrando:
  - Data/hora da declaração
  - Status dos checkboxes (verdade e termos)

```typescript
// Adicionar após últimas seções (antes dos botões):
{app.declaracao_data && (
  <div className="bg-gray-50 border-2 border-gray-100 rounded-[20px] p-5">
    <Sec title="📋 Confirmação" />
    <DossierField label="Data da Declaração" value={fmtDate(app.declaracao_data)} />
    <DossierField label="Declara Verdade" value={app.declara_verdade ? '✅ Sim' : '❌ Não'} />
    <DossierField label="Aceita Termos" value={app.aceita_termos ? '✅ Sim' : '❌ Não'} />
  </div>
)}
```

**Verificação:**
- [ ] Campos de confirmação visíveis no dossiê

---

## FASE 5: TESTES

### Tarefa 5.1 - Teste completo do fluxo

**Procedimento:**
1. [ ] Abrir app, criar novo Client (via ClientRegistrationModal)
2. [ ] Client clica "Fazer parte da comunidade"
3. [ ] Preencher SailorApplicationModal:
   - Step 1: Dados carregados automaticamente ✓
   - Step 2: Selecionar função, caderneta ✓
   - Step 3: Upload de documentos ✓
   - **Step 4:** Data auto-preenchida ✓, marcar checkboxes ✓, enviar ✓
4. [ ] Verificar no Supabase:
   - Candidatura foi criada com `declaracao_data`, `declara_verdade`, `aceita_termos` ✓
5. [ ] Admin abre CandidatosTab
6. [ ] Admin aprova candidatura
7. [ ] **Verificação CRÍTICA:**
   - [ ] NO novo Sailor foi criado (table sailors vazia)
   - [ ] Client original foi transformado:
     - `sailor_status = 'approved'` ✓
     - `sailor_login` preenchido ✓
     - `sailor_password` preenchido ✓
     - `sailor_application_id` = app.id ✓
     - `converted_to_sailor_at` preenchido ✓
   - [ ] Cliente recebeu mensagem com credenciais ✓

---

## RESUMO DE MUDANÇAS

| Arquivo | Tipo | Linhas | Mudança |
|---|---|---|---|
| Schema | SQL | - | +4 colunas ao `clients` |
| SailorApplicationModal.tsx | TSX | 18-24, 80-84, 150+, 160+, 420+, 182+ | Adicionar Step 4 |
| sailor-applications.ts | TS | - | Adicionar campos ao type |
| localStore.ts | TS | 686-771 | Refatorar approveSailorApplication() |
| CandidatosTab.tsx | TSX | ~200 | Visualizar campos finais |

---

## NOTAS IMPORTANTES

1. **Manter compatibilidade backward**: Candidaturas antigas não têm esses campos
   - Usar valores padrão se faltarem

2. **Mensagens de sucesso**: Atualizar texto para refletir "transformação" e não "novo perfil"

3. **Perfil único**: Após aprovação, o client:
   - Continua sendo um client
   - Agora também é um sailor (campos adicionados)
   - Pode acessar áreas de tripulante com `sailor_login`

4. **Histórico**: Campo `converted_to_sailor_at` permite rastrear quando ocorreu a transformação

