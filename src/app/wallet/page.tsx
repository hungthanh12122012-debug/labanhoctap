export const dynamic = "force-dynamic";
import { createClient } from '@/lib/supabase/server';

export default async function WalletPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="p-8">Vui lòng đăng nhập.</div>;
  const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', user.id).single();
  const { data: txs } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-purple-400">Ví tiền</h1>
      <div className="mt-4 rounded-xl border border-purple-900/40 bg-gray-900 p-6">
        <p className="text-gray-400">Số dư</p>
        <p className="text-3xl font-bold text-purple-300">{wallet?.balance ?? 0} đ</p>
      </div>
      <h2 className="mt-6 text-xl font-semibold">Lịch sử giao dịch</h2>
      <ul className="mt-3 space-y-2">
        {(txs ?? []).map((t: any) => (
          <li key={t.id} className="rounded border border-purple-900/30 bg-gray-900 p-3 text-sm">
            {t.type === 'credit' ? '+' : '-'}{t.amount} đ — {t.description} ({new Date(t.created_at).toLocaleString()})
          </li>
        ))}
      </ul>
    </div>
  );
}
