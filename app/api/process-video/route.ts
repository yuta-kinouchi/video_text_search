// app/api/process-video/route.ts
import { Storage } from '@google-cloud/storage';
import { VideoIntelligenceServiceClient, protos } from '@google-cloud/video-intelligence';
import { NextResponse } from 'next/server';

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}'),
});

const videoIntelligenceClient = new VideoIntelligenceServiceClient({
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}'),
});

export async function POST(req: Request) {
  try {
    const { filename } = await req.json();
    const gcsUri = `gs://${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}/${filename}`;

    // 正しい型でfeaturesを指定
    const features = [
      protos.google.cloud.videointelligence.v1.Feature.LABEL_DETECTION,
      protos.google.cloud.videointelligence.v1.Feature.SPEECH_TRANSCRIPTION,
      protos.google.cloud.videointelligence.v1.Feature.TEXT_DETECTION
    ];

    const requestConfig = {
      inputUri: gcsUri,
      features: features,
      videoContext: {
        speechTranscriptionConfig: {
          languageCode: 'ja-JP',
          enableAutomaticPunctuation: true,
        },
      },
    };

    // Video AI処理の開始
    const [operation] = await videoIntelligenceClient.annotateVideo(requestConfig);
    console.log('Processing video:', filename);
    console.log('Operation name:', operation.name);

    // 処理が完了するまで待機
    const [response] = await operation.promise();
    console.log('Video AI processing completed');

    // 結果の整形と保存
    const results = {
      labels: response.annotationResults?.[0]?.segmentLabelAnnotations || [],
      transcript: response.annotationResults?.[0]?.speechTranscriptions || [],
      textDetections: response.annotationResults?.[0]?.textAnnotations || [],
    };

    return NextResponse.json({
      status: 'success',
      results
    });

  } catch (error) {
    console.error('Error processing video:', error);
    return NextResponse.json(
      { error: 'Failed to process video' },
      { status: 500 }
    );
  }
}