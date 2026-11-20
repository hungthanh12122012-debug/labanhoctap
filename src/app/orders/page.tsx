export const dynamic = "force-dynamic";
import { createClient } from '@/lib/supabase/server';

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="p-8">Vui lòng đăng nhập.</div>;
  const { data: orders } = await supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-purple-400">Đơn hàng</h1>
      <ul className="mt-4 space-y-3">
        {(orders ?? []).map((o: any) => (
          <li key={o.id} className="rounded border border-purple-900/30 bg-gray-900 p-4">
            <p className="font-semibold">Đơn #{o.id.slice(0,8)}</p>
            <p className="text-sm text-gray-400">Trạng thái: {o.status} — Tổng: {o.total} đ</p>
            <p className="text-xs text-gray-500">{new Date(o.created_at).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
