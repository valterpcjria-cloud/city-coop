-- ======================================================
-- SCRIPT DE REPARO DEFINITIVO: AVATAR & PERMISSÕES
-- Execute este script no SQL Editor do Supabase
-- ======================================================

-- 1. GARANTIR COLUNAS EM TODAS AS TABELAS
ALTER TABLE managers ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE gestors ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. GARANTIR POLÍTICAS DE ATUALIZAÇÃO (RLS) PARA O PERFIL
-- Isso permite que cada usuário salve seu próprio nome, bio, telefone e foto.

-- Para Managers
DROP POLICY IF EXISTS "Managers can update their own data" ON managers;
CREATE POLICY "Managers can update their own data" ON managers
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Para Gestors
DROP POLICY IF EXISTS "Gestors can update their own data" ON gestors;
CREATE POLICY "Gestors can update their own data" ON gestors
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Para Teachers
DROP POLICY IF EXISTS "Teachers can update their own data" ON teachers;
CREATE POLICY "Teachers can update their own data" ON teachers
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Para Students
DROP POLICY IF EXISTS "Students can update their own data" ON students;
CREATE POLICY "Students can update their own data" ON students
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3. GARANTIR QUE O BUCKET DE AVATARES EXISTE E É PÚBLICO
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 4. POLÍTICAS DE STORAGE (REITERANDO)
DROP POLICY IF EXISTS "Avatar público para leitura" ON storage.objects;
CREATE POLICY "Avatar público para leitura" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Usuários podem subir seus próprios avatares" ON storage.objects;
CREATE POLICY "Usuários podem subir seus próprios avatares" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios avatares" ON storage.objects;
CREATE POLICY "Usuários podem atualizar seus próprios avatares" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);
