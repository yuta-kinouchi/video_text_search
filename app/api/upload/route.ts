import { Storage } from '@google-cloud/storage';
import { NextResponse } from 'next/server';

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}'),
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET || '');

export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json();
    console.log('Generating signed URL for:', { filename, contentType });

    // extensionHeadersを削除し、シンプルな設定に変更
    const [url] = await bucket.file(filename).getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000,
      contentType,
    });

    console.log('Generated signed URL:', url);

    return NextResponse.json({ url, filename });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}