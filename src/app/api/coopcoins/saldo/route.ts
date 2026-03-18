import { createClient } from '@/lib/supabase/server';
import { getStudentId, getSchoolIdByStudent, getSchoolBalance } from '@/lib/coopcoins/services';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return Response.json({ erro: 'Nao autorizado' }, { status: 401 });

  try {
    const studentId = await getStudentId(user.id);
    const schoolId = await getSchoolIdByStudent(studentId);
    if (!schoolId) return Response.json({ erro: 'Escola nao encontrada' }, { status: 404 });
    const saldo = await getSchoolBalance(schoolId);
    return Response.json({ saldo, schoolId });
  } catch {
    return Response.json({ erro: 'Erro interno' }, { status: 500 });
  }
}
