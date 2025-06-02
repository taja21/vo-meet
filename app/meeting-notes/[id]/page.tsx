// app/meeting-notes/[id]/page.tsx

import { createClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';

interface Props {
  params: {
    id: string;
  };
}

export default async function MeetingNoteDetailPage({ params }: Props) {
  const supabase = createClient();
  const { id } = params;

  const { data, error } = await supabase
    .from('meeting_notes')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return notFound();
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">회의록 상세</h1>
      <audio controls className="mb-4 w-full">
        <source src={data.audio_url} type="audio/mpeg" />
        브라우저가 오디오 태그를 지원하지 않습니다.
      </audio>
      <div className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
        {data.transcript || '텍스트 없음'}
      </div>
    </main>
  );
}
