// app/api/transcribe/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  const supabase = createClient();
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filename = `audio/${randomUUID()}-${file.name}`;

  // Supabase Storage에 업로드
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('audio')
    .upload(filename, buffer, {
      contentType: file.type,
    });

  if (uploadError) {
    return NextResponse.json({ error: '파일 업로드 실패' }, { status: 500 });
  }

  const audioUrl = supabase.storage.from('audio').getPublicUrl(filename).data.publicUrl;

  // Whisper API 호출
  const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
    },
    body: (() => {
      const form = new FormData();
      form.append('file', new Blob([buffer], { type: file.type }), file.name);
      form.append('model', 'whisper-1');
      return form;
    })(),
  });

  if (!whisperRes.ok) {
    const error = await whisperRes.text();
    console.error('Whisper API 오류:', error);
    return NextResponse.json({ error: 'Whisper API 실패', detail: error }, { status: 500 });
  }

  const { text: transcript } = await whisperRes.json();

  const { data: inserted, error: dbError } = await supabase
    .from('meeting_notes')
    .insert([{ title: file.name, audio_url: audioUrl, transcript }])
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: 'DB 저장 실패' }, { status: 500 });
  }

  return NextResponse.json({ id: inserted.id });
}
