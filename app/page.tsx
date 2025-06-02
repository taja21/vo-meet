'use client';
console.log('✅ / page.tsx loaded');

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (user) setUser(user);
      else router.push('/login');
    };

    getUser();
  }, [supabase, router]);

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Voice Meeting Notes</h1>
      <ul className="space-y-2">
        <li>
          <a
            href="/record"
            className="block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            🎤 회의 음성 업로드 또는 녹음하기
          </a>
        </li>
        <li>
          <a
            href="/meeting-notes"
            className="block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            📄 회의록 목록 보기
          </a>
        </li>
      </ul>
    </main>
  );
}
