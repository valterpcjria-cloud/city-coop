import { createAdminClient, createClient } from '@/lib/supabase/server';

export async function getStudentId(userId: string): Promise<string> {
    const supabase = await createClient();
    const { data, error } = await (supabase.from('students') as any)
        .select('id').eq('user_id', userId).single();
    if (error) throw new Error('Estudante nao encontrado');
    return data.id;
}

export async function getSchoolIdByStudent(studentId: string): Promise<string | null> {
    const supabase = await createClient();
    const { data, error } = await (supabase.from('students') as any)
        .select('school_id').eq('id', studentId).single();
    if (error || !data?.school_id) return null;
    return data.school_id;
}

export async function getSchoolBalance(schoolId: string): Promise<number> {
    const supabase = await createClient();
    const { data, error } = await (supabase.from('school_wallets') as any)
        .select('balance').eq('school_id', schoolId).maybeSingle();
    if (error) return 0;
    return data?.balance ?? 0;
}

export async function getSchoolTransactions(schoolId: string, limit = 50) {
    const supabase = await createClient();
    const { data, error } = await (supabase.from('coopcoin_transactions') as any)
        .select('*').eq('school_id', schoolId)
        .order('created_at', { ascending: false }).limit(limit);
    if (error) return [];
    return data ?? [];
}

export async function addSchoolTransaction({
    schoolId, studentId, amount, type, description, referenceType,
}: {
    schoolId: string; studentId?: string; amount: number;
    type: 'earn' | 'spend'; description: string; referenceType?: string;
}) {
    const supabase = await createAdminClient();
    const currentBalance = await getSchoolBalance(schoolId);
    const newBalance = type === 'earn' ? currentBalance + amount : currentBalance - amount;
    if (newBalance < 0) throw new Error('Saldo insuficiente');

    const { error: tError } = await (supabase.from('coopcoin_transactions') as any)
        .insert({ school_id: schoolId, student_id: studentId ?? null, amount, type, description, reference_type: referenceType ?? null });
    if (tError) throw tError;

    const { data: wallet } = await (supabase.from('school_wallets') as any)
        .select('id').eq('school_id', schoolId).maybeSingle();

    if (!wallet) {
        await (supabase.from('school_wallets') as any)
            .insert({ school_id: schoolId, balance: newBalance });
    } else {
        await (supabase.from('school_wallets') as any)
            .update({ balance: newBalance, updated_at: new Date().toISOString() })
            .eq('school_id', schoolId);
    }
    return { success: true, newBalance };
}

export async function rewardSchool(studentId: string, amount: number, description: string, referenceType?: string) {
    const schoolId = await getSchoolIdByStudent(studentId);
    if (!schoolId) return { success: false, reason: 'school_not_found' };
    return addSchoolTransaction({ schoolId, studentId, amount, type: 'earn', description, referenceType });
}

export async function spendCoins(schoolId: string, amount: number, description: string) {
    return addSchoolTransaction({ schoolId, amount, type: 'spend', description, referenceType: 'app' });
}

export async function checkAndRewardDailyLogin(userId: string): Promise<{ rewarded: boolean; amount?: number }> {
    try {
        const supabase = await createClient();
        const studentId = await getStudentId(userId);
        const todayBR = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
        todayBR.setHours(0, 0, 0, 0);

        const { data: existing } = await (supabase.from('coopcoin_transactions') as any)
            .select('id')
            .eq('student_id', studentId)
            .eq('reference_type', 'daily_login')
            .gte('created_at', todayBR.toISOString())
            .maybeSingle();

        if (existing) return { rewarded: false };

        const result = await rewardSchool(studentId, 5, 'Login diario', 'daily_login');
        if (!result.success) return { rewarded: false };
        return { rewarded: true, amount: 5 };
    } catch (error) {
        console.error('checkAndRewardDailyLogin error:', error);
        return { rewarded: false };
    }
}