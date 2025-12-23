-- ==========================================
-- FIX: Psychologists RLS Policies
-- Run this in your Supabase SQL Editor
-- ==========================================

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Usuários autenticados podem ver psicólogos ativos" ON public.psychologists;
DROP POLICY IF EXISTS "Usuários autenticados podem cadastrar psicólogos" ON public.psychologists;
DROP POLICY IF EXISTS "Usuários podem editar psicólogos que cadastraram" ON public.psychologists;
DROP POLICY IF EXISTS "Usuários podem deletar psicólogos que cadastraram" ON public.psychologists;

-- Recreate policies with correct authentication checks

-- SELECT Policy: Everyone can view active psychologists (even non-authenticated users for public listing)
CREATE POLICY "Todos podem ver psicólogos ativos"
    ON public.psychologists FOR SELECT
    USING (is_active = TRUE);

-- INSERT Policy: Only authenticated users can create psychologist profiles
CREATE POLICY "Usuários autenticados podem cadastrar psicólogos"
    ON public.psychologists FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- UPDATE Policy: Users can update psychologists they added
CREATE POLICY "Usuários podem editar psicólogos que cadastraram"
    ON public.psychologists FOR UPDATE
    TO authenticated
    USING (auth.uid() = added_by)
    WITH CHECK (auth.uid() = added_by);

-- DELETE Policy: Users can delete psychologists they added
CREATE POLICY "Usuários podem deletar psicólogos que cadastraram"
    ON public.psychologists FOR DELETE
    TO authenticated
    USING (auth.uid() = added_by);

-- ==========================================
-- Verify policies were created successfully
-- ==========================================

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'psychologists'
ORDER BY policyname;
