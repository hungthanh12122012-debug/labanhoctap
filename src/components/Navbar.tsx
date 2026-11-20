import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-purple-900/40 bg-black/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-purple-400">GAME SHOP</Link>
        <div className="flex gap-4 text-sm">
          <Link href="/products" className="hover:text-purple-300">Sản phẩm</Link>
          <Link href="/cart" className="hover:text-purple-300">Giỏ hàng</Link>
          <Link href="/wallet" className="hover:text-purple-300">Ví</Link>
          <Link href="/orders" className="hover:text-purple-300">Đơn hàng</Link>
          <Link href="/login" className="hover:text-purple-300">Đăng nhập</Link>
          <Link href="/admin" className="hover:text-purple-300">Admin</Link>
        </div>
      </div>
    </nav>
  );
}
