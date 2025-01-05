// lib/types.ts
export interface Video {
  id: string;
  title: string;          // オリジナルのファイル名を保存
  url: string;            // Cloud Storage内のURL
  createdAt: string;      // アップロード日時
  status: 'processing' | 'completed' | 'error';
  contentType?: string;   // 動画のMIMEタイプ
  fileSize?: number;      // ファイルサイズ
  duration?: number;      // 動画の長さ（秒）
  thumbnailUrl?: string;  // サムネイルのURL（生成される場合）
  metadata?: {            // Video AIによる分析結果
    labels: string[];     // 検出されたラベル
    transcript: string;   // 音声の文字起こし
    scenes: {             // シーン分析
      startTime: number;
      endTime: number;
      description: string;
    }[];
  };
}

export interface SearchResult {
  timestamp: number;
  confidence: number;
  preview: string;
}