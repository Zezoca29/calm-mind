-- ==========================================
-- SCHEMA DO BANCO DE DADOS SUPABASE
-- CALM MIND APP
-- ==========================================

-- Habilitar Row Level Security (RLS)
-- Isso garante que cada usuário só veja seus próprios dados

-- ==========================================
-- TABELA: mood_entries (Registros de Humor)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.mood_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    local_id INTEGER NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    mood INTEGER CHECK (mood >= 1 AND mood <= 5) NOT NULL,
    anxiety INTEGER CHECK (anxiety >= 1 AND anxiety <= 10) NOT NULL,
    notes TEXT,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, local_id)
);

-- Índices para melhor performance
CREATE INDEX idx_mood_entries_user_id ON public.mood_entries(user_id);
CREATE INDEX idx_mood_entries_date ON public.mood_entries(date);
CREATE INDEX idx_mood_entries_updated_at ON public.mood_entries(updated_at);

-- RLS Policies
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver apenas seus próprios registros de humor"
    ON public.mood_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios registros de humor"
    ON public.mood_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios registros de humor"
    ON public.mood_entries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios registros de humor"
    ON public.mood_entries FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mood_entries_updated_at
    BEFORE UPDATE ON public.mood_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- TABELA: diary_entries (Entradas do Diário)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.diary_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    local_id INTEGER NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, local_id)
);

-- Índices
CREATE INDEX idx_diary_entries_user_id ON public.diary_entries(user_id);
CREATE INDEX idx_diary_entries_date ON public.diary_entries(date);
CREATE INDEX idx_diary_entries_updated_at ON public.diary_entries(updated_at);
CREATE INDEX idx_diary_entries_tags ON public.diary_entries USING GIN(tags);

-- RLS Policies
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver apenas suas próprias entradas de diário"
    ON public.diary_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias entradas de diário"
    ON public.diary_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias entradas de diário"
    ON public.diary_entries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias entradas de diário"
    ON public.diary_entries FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger
CREATE TRIGGER update_diary_entries_updated_at
    BEFORE UPDATE ON public.diary_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- TABELA: breathing_sessions (Sessões de Respiração)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.breathing_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    local_id INTEGER NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    exercise TEXT NOT NULL,
    duration INTEGER NOT NULL,
    completed BOOLEAN DEFAULT TRUE,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, local_id)
);

-- Índices
CREATE INDEX idx_breathing_sessions_user_id ON public.breathing_sessions(user_id);
CREATE INDEX idx_breathing_sessions_date ON public.breathing_sessions(date);
CREATE INDEX idx_breathing_sessions_updated_at ON public.breathing_sessions(updated_at);

-- RLS Policies
ALTER TABLE public.breathing_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver apenas suas próprias sessões de respiração"
    ON public.breathing_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias sessões de respiração"
    ON public.breathing_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias sessões de respiração"
    ON public.breathing_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias sessões de respiração"
    ON public.breathing_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger
CREATE TRIGGER update_breathing_sessions_updated_at
    BEFORE UPDATE ON public.breathing_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- TABELA: sleep_entries (Registros de Sono)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.sleep_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    local_id INTEGER NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    sleep_time TIMESTAMPTZ NOT NULL,
    wake_time TIMESTAMPTZ NOT NULL,
    duration NUMERIC(4,2) NOT NULL,
    quality INTEGER CHECK (quality >= 1 AND quality <= 5) NOT NULL,
    notes TEXT,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, local_id)
);

-- Índices
CREATE INDEX idx_sleep_entries_user_id ON public.sleep_entries(user_id);
CREATE INDEX idx_sleep_entries_date ON public.sleep_entries(date);
CREATE INDEX idx_sleep_entries_quality ON public.sleep_entries(quality);
CREATE INDEX idx_sleep_entries_updated_at ON public.sleep_entries(updated_at);

-- RLS Policies
ALTER TABLE public.sleep_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver apenas seus próprios registros de sono"
    ON public.sleep_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios registros de sono"
    ON public.sleep_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios registros de sono"
    ON public.sleep_entries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios registros de sono"
    ON public.sleep_entries FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger
CREATE TRIGGER update_sleep_entries_updated_at
    BEFORE UPDATE ON public.sleep_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- TABELA: psychologists (Psicólogos Cadastrados)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.psychologists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    crp TEXT NOT NULL UNIQUE, -- Registro no Conselho Regional de Psicologia
    specialty TEXT[], -- Especialidades (ex: ["Ansiedade", "Depressão", "TCC"])
    bio TEXT, -- Biografia/Apresentação
    phone TEXT,
    email TEXT,
    website TEXT,

    -- Endereço
    address_street TEXT,
    address_number TEXT,
    address_complement TEXT,
    address_neighborhood TEXT,
    address_city TEXT,
    address_state TEXT,
    address_zipcode TEXT,

    -- Atendimento
    accepts_online BOOLEAN DEFAULT FALSE,
    accepts_in_person BOOLEAN DEFAULT TRUE,
    insurance_plans TEXT[], -- Planos aceitos
    price_range TEXT, -- Ex: "R$ 100-150"

    -- Mídia
    photo_url TEXT,

    -- Avaliação
    rating NUMERIC(3,2) CHECK (rating >= 0 AND rating <= 5),
    total_reviews INTEGER DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    verified BOOLEAN DEFAULT FALSE, -- Se foi verificado pela administração

    -- Metadados
    added_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_psychologists_name ON public.psychologists(name);
CREATE INDEX idx_psychologists_crp ON public.psychologists(crp);
CREATE INDEX idx_psychologists_city ON public.psychologists(address_city);
CREATE INDEX idx_psychologists_state ON public.psychologists(address_state);
CREATE INDEX idx_psychologists_specialty ON public.psychologists USING GIN(specialty);
CREATE INDEX idx_psychologists_is_active ON public.psychologists(is_active);

-- RLS Policies
ALTER TABLE public.psychologists ENABLE ROW LEVEL SECURITY;

-- Todos podem visualizar psicólogos ativos (público)
CREATE POLICY "Todos podem ver psicólogos ativos"
    ON public.psychologists FOR SELECT
    USING (is_active = TRUE);

-- Usuários autenticados podem cadastrar psicólogos
CREATE POLICY "Usuários autenticados podem cadastrar psicólogos"
    ON public.psychologists FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Apenas quem cadastrou pode editar (ou admins, quando implementado)
CREATE POLICY "Usuários podem editar psicólogos que cadastraram"
    ON public.psychologists FOR UPDATE
    TO authenticated
    USING (auth.uid() = added_by)
    WITH CHECK (auth.uid() = added_by);

-- Apenas quem cadastrou pode deletar (ou admins)
CREATE POLICY "Usuários podem deletar psicólogos que cadastraram"
    ON public.psychologists FOR DELETE
    TO authenticated
    USING (auth.uid() = added_by);

-- Trigger
CREATE TRIGGER update_psychologists_updated_at
    BEFORE UPDATE ON public.psychologists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- VIEWS ÚTEIS PARA ANÁLISE
-- ==========================================

-- View: Estatísticas de humor por usuário
CREATE OR REPLACE VIEW user_mood_stats AS
SELECT 
    user_id,
    COUNT(*) as total_entries,
    AVG(mood) as avg_mood,
    AVG(anxiety) as avg_anxiety,
    MIN(date) as first_entry,
    MAX(date) as last_entry
FROM public.mood_entries
GROUP BY user_id;

-- View: Estatísticas de sono por usuário
CREATE OR REPLACE VIEW user_sleep_stats AS
SELECT 
    user_id,
    COUNT(*) as total_entries,
    AVG(duration) as avg_duration,
    AVG(quality) as avg_quality,
    MIN(date) as first_entry,
    MAX(date) as last_entry
FROM public.sleep_entries
GROUP BY user_id;

-- View: Total de exercícios de respiração por usuário
CREATE OR REPLACE VIEW user_breathing_stats AS
SELECT 
    user_id,
    COUNT(*) as total_sessions,
    SUM(duration) as total_duration,
    exercise,
    COUNT(*) as exercise_count
FROM public.breathing_sessions
GROUP BY user_id, exercise;

-- ==========================================
-- FUNÇÃO: Backup de dados do usuário
-- ==========================================

CREATE OR REPLACE FUNCTION backup_user_data(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'mood_entries', (SELECT json_agg(row_to_json(t)) FROM (SELECT * FROM mood_entries WHERE user_id = p_user_id) t),
        'diary_entries', (SELECT json_agg(row_to_json(t)) FROM (SELECT * FROM diary_entries WHERE user_id = p_user_id) t),
        'breathing_sessions', (SELECT json_agg(row_to_json(t)) FROM (SELECT * FROM breathing_sessions WHERE user_id = p_user_id) t),
        'sleep_entries', (SELECT json_agg(row_to_json(t)) FROM (SELECT * FROM sleep_entries WHERE user_id = p_user_id) t)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- COMENTÁRIOS NAS TABELAS
-- ==========================================

COMMENT ON TABLE public.mood_entries IS 'Armazena registros de humor dos usuários';
COMMENT ON TABLE public.diary_entries IS 'Armazena entradas do diário emocional';
COMMENT ON TABLE public.breathing_sessions IS 'Armazena sessões de exercícios de respiração';
COMMENT ON TABLE public.sleep_entries IS 'Armazena registros de sono dos usuários';
COMMENT ON TABLE public.psychologists IS 'Armazena informações de psicólogos cadastrados';

-- ==========================================
-- FIM DO SCHEMA
-- ==========================================
