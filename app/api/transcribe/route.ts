// app/api/transcribe/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  const supabase = createClient();
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    console.error('❌ 파일 없음');
    return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filename = `audio/${randomUUID()}-${file.name}`;
  console.log('📁 업로드 파일 이름:', filename);

  // Supabase Storage에 업로드
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('audio')
    .upload(filename, buffer, {
      contentType: file.type,
    });

  if (uploadError) {
    console.error('❌ 업로드 실패:', uploadError);
    return NextResponse.json({ error: '파일 업로드 실패', detail: uploadError.message }, { status: 500 });
  }

  console.log('✅ 업로드 성공:', uploadData);

  const audioUrl = supabase.storage.from('audio').getPublicUrl(filename).data.publicUrl;
  console.log('🔗 공개 URL:', audioUrl);

  // Whisper 없이 저장
  const transcript = '🧪 Whisper 없이 저장된 테스트 회의록입니다.';

  const { data: inserted, error: dbError } = await supabase
    .from('meeting_notes')
    .insert([{ title: file.name, audio_url: audioUrl, transcript }])
    .select()
    .single();

  if (dbError) {
    console.error('❌ DB 저장 실패:', dbError);
    return NextResponse.json({ error: 'DB 저장 실패', detail: dbError.message }, { status: 500 });
  }

  console.log('📝 저장 완료:', inserted);

  return NextResponse.json({ id: inserted.id });
}
