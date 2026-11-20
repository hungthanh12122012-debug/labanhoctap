export const dynamic = "force-dynamic";
import { createClient } from '@/lib/supabase/server';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="p-8">Vui lòng đăng nhập admin.</div>;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return <div className="p-8 text-red-400">Không có quyền truy cập.</div>;
  const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true });
  const { count: totalCustomers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user');
  const { data: revenue } = await supabase.from('orders').select('total').eq('status', 'completed');
  const totalRevenue = (revenue ?? []).reduce((s: number, o: any) => s + Number(o.total), 0);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-purple-400">Admin Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-purple-900/40 bg-gray-900 p-4"><p className="text-gray-400">Tổng doanh thu</p><p className="text-2xl font-bold text-purple-300">{totalRevenue} đ</p></div>
        <div className="rounded-xl border border-purple-900/40 bg-gray-900 p-4"><p className="text-gray-400">Tổng đơn</p><p className="text-2xl font-bold">{totalOrders ?? 0}</p></div>
        <div className="rounded-xl border border-purple-900/40 bg-gray-900 p-4"><p className="text-gray-400">Khách hàng</p><p className="text-2xl font-bold">{totalCustomers ?? 0}</p></div>
      </div>
      <p className="mt-6 text-gray-400">Quản lý sản phẩm, đơn hàng, khách hàng tại các trang con.</p>
    </div>
  );
}
