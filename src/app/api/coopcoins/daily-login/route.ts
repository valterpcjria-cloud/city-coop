import { createClient } from '@/lib/supabase/server';
import { checkAndRewardDailyLogin } from '@/lib/coopcoins/services';

export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await checkAndRewardDailyLogin(user.id);
  return Response.json({ rewarded: result.rewarded, amount: result.amount ?? 0 });
}
