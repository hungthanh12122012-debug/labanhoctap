'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const router = useRouter();
  async function submit(e: React.FormEvent) {
    const supabase = createClient();
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    if (error) setErr(error.message);
    else router.push('/login');
  }
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold text-purple-400">Đăng ký</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input className="w-full rounded border border-purple-900/40 bg-gray-900 p-2" placeholder="Họ tên" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full rounded border border-purple-900/40 bg-gray-900 p-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full rounded border border-purple-900/40 bg-gray-900 p-2" type="password" placeholder="Mật khẩu" value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button className="w-full rounded bg-purple-600 py-2 font-semibold">Đăng ký</button>
      </form>
    </div>
  );
}
