import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: quizId } = await params;

  const { data: responses, error } = await (supabase.from('quiz_responses') as any)
    .select('*, student:students(id, name)')
    .eq('quiz_id', quizId)
    .order('score', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const total = responses.length;
  const media = total > 0
    ? Math.round(responses.reduce((acc: number, r: any) => acc + (r.score || 0), 0) / total)
    : 0;

  return NextResponse.json({ responses, total, media });
}
