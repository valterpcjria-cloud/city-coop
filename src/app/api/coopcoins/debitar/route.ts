import { createClient } from '@/lib/supabase/server';
import { spendCoins } from '@/lib/coopcoins/services';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return Response.json({ erro: 'Nao autorizado' }, { status: 401 });


  const { data: teacher } = await (supabase.from('teachers') as any)
    .select('school_id').eq('user_id', user.id).single();

  if (!teacher?.school_id) {
    return Response.json({ erro: 'Apenas professores podem debitar COOPCOINS' }, { status: 403 });
  }

  const { valor, motivo } = await request.json();
  if (!valor || !motivo) return Response.json({ erro: 'Campos obrigatorios: valor, motivo' }, { status: 400 });

  try {
    const resultado = await spendCoins(teacher.school_id, valor, motivo);
    return Response.json(resultado);
  } catch (err: any) {
    const status = err.message === 'Saldo insuficiente' ? 422 : 500;
    return Response.json({ erro: err.message }, { status });
  }
}
