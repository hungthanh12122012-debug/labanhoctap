export const dynamic = "force-dynamic";
import { createClient } from '@/lib/supabase/server';

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase.from('products').select('*').eq('visible', true).order('created_at', { ascending: false });
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-purple-400">Sản phẩm</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {(products ?? []).map((p: any) => (
          <div key={p.id} className="rounded-xl border border-purple-900/40 bg-gray-900 p-4">
            <div className="aspect-square w-full rounded bg-gray-800" />
            <h3 className="mt-3 font-semibold">{p.name}</h3>
            <p className="text-sm text-gray-400">{p.game} • {p.rarity}</p>
            <p className="mt-2 text-purple-300 font-bold">{p.price} đ</p>
            <p className="text-xs text-gray-500">Còn: {p.stock}</p>
          </div>
        ))}
      </div>
      {(!products || products.length === 0) && <p className="mt-4 text-gray-500">Chưa có sản phẩm.</p>}
    </div>
  );
}
