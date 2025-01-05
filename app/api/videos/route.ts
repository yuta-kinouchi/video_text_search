// app/api/videos/route.ts
import { Storage } from '@google-cloud/storage';
import { NextResponse } from 'next/server';

// APIルートの動的レンダリングを有効化
export const dynamic = 'force-dynamic';

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}'),
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET || '');

export async function GET() {
  try {
    // videos/ プレフィックスを持つファイルのみを取得
    const [files] = await bucket.getFiles({
      prefix: 'videos/',
    });

    // 各ファイルの署名付きURLと必要な情報を取得
    const videos = await Promise.all(
      files.map(async (file) => {
        try {
          // 署名付きURLを生成（15分有効）
          const [url] = await file.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000,
          });

          // ファイルのメタデータを取得
          const [metadata] = await file.getMetadata();

          // アップロード日時を日本時間に変換
          const createdAt = new Date(metadata.timeCreated);
          const updatedAt = new Date(metadata.updated);

          // ファイル名から拡張子を取得
          const extension = file.name.split('.').pop()?.toLowerCase() || '';

          return {
            id: file.name, // ファイル名をIDとして使用
            filename: file.name,
            originalName: metadata.metadata?.originalName || file.name.split('/').pop() || '',
            url,
            contentType: metadata.contentType || `video/${extension}`,
            size: parseInt(metadata.size),
            createdAt: createdAt.toISOString(),
            updatedAt: updatedAt.toISOString(),
            // Video AI の処理結果があれば含める
            labels: metadata.metadata?.labels ? JSON.parse(metadata.metadata.labels) : [],
            transcript: metadata.metadata?.transcript ? JSON.parse(metadata.metadata.transcript) : '',
            textDetections: metadata.metadata?.textDetections ? JSON.parse(metadata.metadata.textDetections) : [],
          };
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          return null;
        }
      })
    );

    // nullを除外し、作成日時の新しい順にソート
    const validVideos = videos
      .filter((video): video is NonNullable<typeof video> => video !== null)
      .sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    return NextResponse.json({
      videos: validVideos,
      totalCount: validVideos.length
    });

  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}