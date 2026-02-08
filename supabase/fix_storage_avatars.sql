-- =============================================
-- FIX: Create Avatars Bucket and Setup Policies
-- Execute este script no SQL Editor do Supabase
-- =============================================

-- 1. Criar o bucket se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Habilitar RLS no bucket de objetos (se necessário)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas para evitar duplicidade
DROP POLICY IF EXISTS "Avatar público para leitura" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem subir seus próprios avatares" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios avatares" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios avatares" ON storage.objects;

-- 4. Criar política de leitura pública
CREATE POLICY "Avatar público para leitura" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- 5. Criar política de upload (INSERT)
CREATE POLICY "Usuários podem subir seus próprios avatares" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    (auth.uid())::text = (storage.foldername(name))[1]
  );

-- 6. Criar política de atualização (UPDATE)
CREATE POLICY "Usuários podem atualizar seus próprios avatares" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    (auth.uid())::text = (storage.foldername(name))[1]
  );

-- 7. Criar política de deleção (DELETE)
CREATE POLICY "Usuários podem deletar seus próprios avatares" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    (auth.uid())::text = (storage.foldername(name))[1]
  );
