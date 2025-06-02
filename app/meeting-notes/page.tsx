// app/meeting-notes/page.tsx

import Link from 'next/link';
import { createClient } from '@/lib/supabase';

export default async function MeetingNotesListPage() {
  const supabase = createClient();
  const {
    data: notes,
    error,
  } = await supabase.from('meeting_notes').select('*').order('created_at', { ascending: false });

  if (error) {
    return (
      <main className="p-6">
        <p className="text-red-500">회의록을 불러오는 데 실패했습니다.</p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">회의록 목록</h1>
      {notes.length === 0 ? (
        <p>저장된 회의록이 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {notes.map((note) => (
            <li key={note.id} className="border p-4 rounded hover:shadow">
              <Link href={`/meeting-notes/${note.id}`} className="text-blue-600 font-medium hover:underline">
                회의록 ID: {note.id}
              </Link>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(note.created_at).toLocaleString()}
              </p>
              <p className="line-clamp-2 text-gray-800 mt-2">
                {note.transcript?.slice(0, 100) || '내용 없음'}...
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
