// app/admin/page.tsx

import Link from 'next/link';
import { createClient } from '@/lib/supabase';

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const { data: notes, error } = await supabase
    .from('meeting_notes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <main className="p-6">
        <p className="text-red-500">회의록 목록 로딩 실패</p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">관리자 회의록 목록</h1>
      <ul className="space-y-4">
        {notes.map((note) => (
          <li key={note.id} className="border p-4 rounded">
            <Link
              href={`/admin/${note.id}`}
              className="text-blue-600 font-semibold hover:underline"
            >
              회의록 ID: {note.id}
            </Link>
            <p className="text-sm text-gray-500 mt-1">User ID: {note.user_id}</p>
            <p className="text-sm text-gray-600">
              {new Date(note.created_at).toLocaleString()}
            </p>
            <p className="text-gray-700 mt-2 line-clamp-2">
              {note.transcript?.slice(0, 100) || '내용 없음'}...
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
