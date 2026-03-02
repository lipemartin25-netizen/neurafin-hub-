-- ============================================================
-- 🧠 NEURAFIN HUB v3.0 - DATABASE SCHEMA COMPLETO
-- INCLUI: Tudo do v1 + v2 + boletos + open finance
--         + wealth lab + academy + MEI + couples
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- MANTER TODAS AS TABELAS DO v1 E v2:
-- profiles, families, accounts, categories, transactions,
-- budgets, goals, bills, ai_interactions, notifications,
-- audit_logs, user_sessions, two_factor_auth, rate_limit_log
-- + TODOS triggers, functions, RLS, indexes, storage
-- ============================================================
-- (COPIAR INTEGRALMENTE do schema v1 + v2)
-- DEPOIS ADICIONAR as tabelas abaixo:

-- ============================================================
-- CREDIT_CARD_INVOICES (Faturas cartão de crédito)
-- ============================================================
CREATE TABLE public.credit_card_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INT NOT NULL,
  open_date DATE NOT NULL,
  close_date DATE NOT NULL,
  due_date DATE NOT NULL,
  total_amount DECIMAL(15,2) DEFAULT 0,
  minimum_payment DECIMAL(15,2),
  status TEXT DEFAULT 'open' CHECK (status IN (
    'open', 'closed', 'paid', 'partial', 'overdue'
  )),
  paid_amount DECIMAL(15,2) DEFAULT 0,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, year, month)
);

CREATE INDEX idx_invoices_account ON public.credit_card_invoices(account_id, year DESC, month DESC);
CREATE INDEX idx_invoices_status ON public.credit_card_invoices(status) WHERE status != 'paid';

ALTER TABLE public.credit_card_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own invoices"
  ON public.credit_card_invoices FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- BOLETOS (DDA - Débito Direto Autorizado)
-- ============================================================
CREATE TABLE public.boletos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,

  -- Dados do boleto
  barcode TEXT,                          -- Código de barras (44 dígitos)
  digitable_line TEXT,                   -- Linha digitável
  amount DECIMAL(15,2) NOT NULL,
  discount_amount DECIMAL(15,2),
  fine_amount DECIMAL(15,2),
  interest_amount DECIMAL(15,2),
  final_amount DECIMAL(15,2),            -- Valor final (com multa/desconto)

  -- Identificação
  beneficiary_name TEXT,                 -- Quem recebe (cedente)
  beneficiary_document TEXT,             -- CNPJ/CPF cedente
  payer_name TEXT,                       -- Quem paga (sacado)
  payer_document TEXT,                   -- CNPJ/CPF sacado

  -- Datas
  issue_date DATE,                       -- Data emissão
  due_date DATE NOT NULL,                -- Data vencimento
  payment_date DATE,                     -- Data pagamento (quando pago)

  -- Classificação
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  type TEXT DEFAULT 'utility' CHECK (type IN (
    'utility',          -- Concessionária (água, luz, gás)
    'tax',              -- Imposto (IPTU, IPVA, DAS)
    'bank_slip',        -- Boleto bancário
    'insurance',        -- Seguro
    'rent',             -- Aluguel
    'condominium',      -- Condomínio
    'education',        -- Escola/faculdade
    'health',           -- Plano saúde
    'subscription',     -- Assinatura
    'other'
  )),

  -- DDA
  dda_detected BOOLEAN DEFAULT false,    -- Detectado via DDA
  dda_source TEXT,                       -- Banco que enviou DDA

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',          -- Pendente
    'paid',             -- Pago
    'overdue',          -- Vencido
    'cancelled',        -- Cancelado
    'scheduled'         -- Agendado
  )),

  -- Recorrência
  is_recurring BOOLEAN DEFAULT false,
  bill_id UUID REFERENCES public.bills(id) ON DELETE SET NULL,

  -- Meta
  notes TEXT,
  open_finance_id TEXT,                  -- ID no Open Finance
  ai_categorized BOOLEAN DEFAULT false,
  ai_confidence DECIMAL(3,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_boletos_user ON public.boletos(user_id, due_date DESC);
CREATE INDEX idx_boletos_status ON public.boletos(status) WHERE status IN ('pending', 'overdue');
CREATE INDEX idx_boletos_barcode ON public.boletos(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_boletos_due ON public.boletos(due_date) WHERE status = 'pending';

ALTER TABLE public.boletos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own boletos"
  ON public.boletos FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- OPEN_FINANCE_CONNECTIONS (Conexões bancárias)
-- ============================================================
CREATE TABLE public.open_finance_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution_id TEXT NOT NULL,          -- ID da instituição
  institution_name TEXT NOT NULL,
  institution_logo TEXT,
  consent_id TEXT NOT NULL UNIQUE,       -- ID consentimento (encrypted)
  consent_status TEXT DEFAULT 'active' CHECK (consent_status IN (
    'pending', 'active', 'expired', 'revoked'
  )),
  consent_expires_at TIMESTAMPTZ,
  permissions TEXT[] DEFAULT '{         -- Permissões concedidas
    ACCOUNTS_READ,
    ACCOUNTS_BALANCES_READ,
    TRANSACTIONS_READ,
    CREDIT_CARDS_READ,
    CREDIT_CARDS_BILLS_READ,
    BOLETOS_READ
  }',
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'idle' CHECK (sync_status IN (
    'idle', 'syncing', 'success', 'error'
  )),
  sync_error TEXT,
  total_synced_transactions INT DEFAULT 0,
  accounts_linked UUID[] DEFAULT '{}',   -- IDs das contas locais vinculadas
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_of_connections_user ON public.open_finance_connections(user_id);
CREATE INDEX idx_of_connections_status ON public.open_finance_connections(consent_status);

ALTER TABLE public.open_finance_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own connections"
  ON public.open_finance_connections FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- OPEN_FINANCE_SYNC_LOG (Log de sincronizações)
-- ============================================================
CREATE TABLE public.open_finance_sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID NOT NULL REFERENCES public.open_finance_connections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL CHECK (sync_type IN (
    'initial_90_days',    -- Primeira sync (90 dias)
    'incremental',        -- Sync diária
    'manual',             -- Forçada pelo user
    'full_refresh'        -- Re-sync completa
  )),
  status TEXT DEFAULT 'running' CHECK (status IN (
    'running', 'completed', 'partial', 'failed'
  )),
  transactions_found INT DEFAULT 0,
  transactions_imported INT DEFAULT 0,
  transactions_categorized INT DEFAULT 0,
  transactions_duplicate INT DEFAULT 0,
  boletos_found INT DEFAULT 0,
  boletos_imported INT DEFAULT 0,
  date_from DATE,
  date_to DATE,
  duration_ms INT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.open_finance_sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own sync logs"
  ON public.open_finance_sync_log FOR SELECT USING (user_id = auth.uid());

-- ============================================================
-- WEALTH_LAB_SIMULATIONS (Simulações salvas)
-- ============================================================
CREATE TABLE public.wealth_lab_simulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'independence', 'retirement', 'investment',
    'tax_planning', 'objective', 'mei_projection'
  )),
  name TEXT NOT NULL,
  inputs JSONB NOT NULL,                 -- Parâmetros da simulação
  results JSONB NOT NULL,                -- Resultados calculados
  is_favorite BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_simulations_user ON public.wealth_lab_simulations(user_id, type);

ALTER TABLE public.wealth_lab_simulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own simulations"
  ON public.wealth_lab_simulations FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- ACADEMY_PROGRESS (Progresso academia financeira)
-- ============================================================
CREATE TABLE public.academy_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,               -- ID do módulo
  lesson_id TEXT NOT NULL,               -- ID da aula
  status TEXT DEFAULT 'not_started' CHECK (status IN (
    'not_started', 'in_progress', 'completed'
  )),
  quiz_score DECIMAL(5,2),               -- Nota do quiz (0-100)
  quiz_attempts INT DEFAULT 0,
  time_spent_seconds INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id, lesson_id)
);

CREATE INDEX idx_academy_user ON public.academy_progress(user_id);

ALTER TABLE public.academy_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own progress"
  ON public.academy_progress FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- COUPLES_SHARED (Gastos compartilhados casal)
-- ============================================================
CREATE TABLE public.couples_shared (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  partner_1_id UUID NOT NULL REFERENCES public.profiles(id),
  partner_2_id UUID NOT NULL REFERENCES public.profiles(id),
  split_type TEXT DEFAULT 'equal' CHECK (split_type IN (
    'equal',              -- 50/50
    'proportional',       -- Proporcional à renda
    'custom'              -- Personalizado por categoria
  )),
  partner_1_income DECIMAL(15,2),
  partner_2_income DECIMAL(15,2),
  custom_splits JSONB,                   -- { "category_id": { "p1": 60, "p2": 40 } }
  settlement_day INT DEFAULT 1 CHECK (settlement_day BETWEEN 1 AND 28),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.couples_shared ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can manage"
  ON public.couples_shared FOR ALL
  USING (partner_1_id = auth.uid() OR partner_2_id = auth.uid());

-- ============================================================
-- COUPLES_EXPENSES (Despesas do casal)
-- ============================================================
CREATE TABLE public.couples_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES public.couples_shared(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  paid_by UUID NOT NULL REFERENCES public.profiles(id),
  amount DECIMAL(15,2) NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  split_p1 DECIMAL(5,2) DEFAULT 50.00,  -- % parceiro 1
  split_p2 DECIMAL(5,2) DEFAULT 50.00,  -- % parceiro 2
  is_settled BOOLEAN DEFAULT false,
  settled_at TIMESTAMPTZ,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.couples_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can manage expenses"
  ON public.couples_expenses FOR ALL
  USING (couple_id IN (
    SELECT id FROM public.couples_shared
    WHERE partner_1_id = auth.uid() OR partner_2_id = auth.uid()
  ));

-- ============================================================
-- MEI_DATA (Dados MEI do usuário)
-- ============================================================
CREATE TABLE public.mei_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  cnpj TEXT,
  company_name TEXT,
  activity_code TEXT,                    -- CNAE
  activity_description TEXT,
  registration_date DATE,
  annual_limit DECIMAL(15,2) DEFAULT 81000.00,
  das_amount DECIMAL(10,2),              -- Valor DAS mensal
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mei_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own mei data"
  ON public.mei_data FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- MEI_REVENUE (Faturamento mensal MEI)
-- ============================================================
CREATE TABLE public.mei_revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mei_id UUID NOT NULL REFERENCES public.mei_data(id) ON DELETE CASCADE,
  year INT NOT NULL,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  gross_revenue DECIMAL(15,2) DEFAULT 0,
  invoices_count INT DEFAULT 0,
  das_paid BOOLEAN DEFAULT false,
  das_paid_at TIMESTAMPTZ,
  das_amount DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, year, month)
);

CREATE INDEX idx_mei_revenue_user ON public.mei_revenue(user_id, year DESC, month DESC);

ALTER TABLE public.mei_revenue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own revenue"
  ON public.mei_revenue FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- ADDITIONAL FUNCTIONS
-- ============================================================

-- Calculate couple balance
CREATE OR REPLACE FUNCTION public.calculate_couple_balance(p_couple_id UUID)
RETURNS TABLE(partner_id UUID, total_paid DECIMAL, should_pay DECIMAL, balance DECIMAL) AS $$
BEGIN
  RETURN QUERY
  WITH expenses AS (
    SELECT
      ce.paid_by,
      ce.amount,
      ce.split_p1,
      ce.split_p2,
      cs.partner_1_id,
      cs.partner_2_id
    FROM public.couples_expenses ce
    JOIN public.couples_shared cs ON cs.id = ce.couple_id
    WHERE ce.couple_id = p_couple_id
      AND ce.is_settled = false
  ),
  partner_totals AS (
    SELECT
      partner_1_id as pid,
      SUM(CASE WHEN paid_by = partner_1_id THEN amount ELSE 0 END) as paid,
      SUM(amount * split_p1 / 100) as should
    FROM expenses
    GROUP BY partner_1_id
    UNION ALL
    SELECT
      partner_2_id as pid,
      SUM(CASE WHEN paid_by = partner_2_id THEN amount ELSE 0 END) as paid,
      SUM(amount * split_p2 / 100) as should
    FROM expenses
    GROUP BY partner_2_id
  )
  SELECT
    pid as partner_id,
    paid as total_paid,
    should as should_pay,
    (paid - should) as balance
  FROM partner_totals;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate MEI annual revenue
CREATE OR REPLACE FUNCTION public.calculate_mei_annual_revenue(
  p_user_id UUID,
  p_year INT
)
RETURNS DECIMAL AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(gross_revenue)
     FROM public.mei_revenue
     WHERE user_id = p_user_id AND year = p_year),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-detect overdue boletos
CREATE OR REPLACE FUNCTION public.update_overdue_boletos()
RETURNS VOID AS $$
BEGIN
  UPDATE public.boletos
  SET status = 'overdue', updated_at = NOW()
  WHERE status = 'pending'
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.boletos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.credit_card_invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.couples_expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.open_finance_connections;
