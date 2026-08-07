import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getSession } from '@/lib/api-helpers';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    const session = await getSession(await headers());
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('pitchDeck') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (file.size > 5_000_000) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Validate type (basic)
    if (!file.name.match(/\.(pdf|ppt|pptx)$/i)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const blob = await put(file.name, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
