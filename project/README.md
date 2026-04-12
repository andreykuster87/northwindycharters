# NorthWindy - Charter Marketplace

Uma aplicação web full-stack SaaS para aluguel de passeios de barco, conectando usuários a marinheiros profissionais de forma rápida, segura e visualmente atraente.

## Funcionalidades

### Para Clientes
- **Landing Page Impactante**: Hero section com imagem náutica de alta qualidade
- **Catálogo de Embarcações**: Grade com 6 barcos, mostrando fotos, capacidade, localização e preços
- **Sistema de Reserva Inteligente**:
  - Calendário interativo para seleção de datas
  - Slots de tempo fixos (Manhã, Tarde, Pôr do Sol)
  - Bloqueio automático de horários já reservados
  - Integração direta com WhatsApp para confirmação
- **Proposta de Valor Clara**: Seção destacando segurança, transparência e facilidade

### Para Administradores
- **Dashboard Completo**:
  - KPIs financeiros (Receita Total, Receita Mensal)
  - Volume de reservas e status
  - Tabela de agendamentos com filtros
  - Gestão de status das reservas
- **Acesso Seguro**: Login protegido por senha (senha padrão: `admin123`)

## Stack Tecnológica

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Ícones**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Backend**: Supabase (RLS + Edge Functions ready)

## Estrutura do Banco de Dados

### Tabelas
- `sailors`: Marinheiros profissionais verificados
- `boats`: Embarcações com detalhes completos (capacidade, preço, equipamentos)
- `bookings`: Reservas dos clientes

### Segurança
- Row Level Security (RLS) habilitado em todas as tabelas
- Políticas configuradas para acesso público controlado
- Dados sensíveis protegidos por autenticação

## Como Usar

### Cliente
1. Acesse a landing page
2. Clique em "Explorar Destinos"
3. Escolha uma embarcação no catálogo
4. Selecione data e horário desejados
5. Preencha nome e WhatsApp
6. Confirme a reserva (abre WhatsApp automaticamente)

### Administrador
1. Clique no ícone de cadeado (canto inferior direito)
2. Digite a senha: `admin123`
3. Visualize KPIs e gerencie reservas
4. Atualize status dos agendamentos

## Design System

- **Paleta**: Azul Náutico (#1e3a8a), Branco Puro, Cinza Executivo
- **Tipografia**: Font weight black para títulos, regular para corpo
- **Bordas**: Cantos extremamente arredondados (rounded-[40px])
- **Estilo**: Mobile-first, minimalista, SaaS premium

## Dados de Exemplo

O banco já vem populado com:
- 3 marinheiros verificados
- 6 embarcações variadas (lanchas, veleiros, catamarã, iate, escuna)
- Preços variando de R$380 a R$850 por passeio
- Localizações: Rio de Janeiro, Santos, Salvador, Angra dos Reis, Porto Belo

## Próximos Passos Sugeridos

1. Implementar autenticação real para administradores
2. Adicionar upload de imagens personalizadas
3. Integrar gateway de pagamento
4. Criar relatórios PDF exportáveis
5. Implementar notificações por email
6. Adicionar avaliações e reviews dos clientes
