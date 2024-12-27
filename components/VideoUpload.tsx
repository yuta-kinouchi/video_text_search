import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';

export function VideoUpload() {
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 1. 署名付きURLを取得
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: `videos/${Date.now()}-${file.name}`,
          contentType: file.type,
        }),
      });

      if (!response.ok) throw new Error('Failed to get upload URL');

      const { url, filename } = await response.json();

      // 2. 署名付きURLを使用してCloud Storageに直接アップロード
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Content-Type', file.type);

      // プログレス監視
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(percentComplete);
        }
      };

      // アップロード完了時の処理
      xhr.onload = async () => {
        if (xhr.status === 200) {
          // 3. アップロード完了後の処理（例：データベースに記録）
          const processResponse = await fetch('/api/process', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              filename,
              originalName: file.name,
            }),
          });

          if (!processResponse.ok) {
            throw new Error('Failed to process video');
          }
        } else {
          throw new Error('Upload failed');
        }
      };

      // エラーハンドリング
      xhr.onerror = () => {
        setUploadProgress(0);
        throw new Error('Upload failed');
      };

      // アップロード実行
      xhr.send(file);

    } catch (error) {
      console.error('Error during upload:', error);
      setUploadProgress(0);
      // TODO: エラー表示の実装
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="file"
        accept="video/*"
        onChange={handleFileUpload}
        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
      />
      {uploadProgress > 0 && (
        <div className="space-y-2">
          <Progress value={uploadProgress} />
          <p className="text-sm text-muted-foreground">
            Uploading: {Math.round(uploadProgress)}%
          </p>
        </div>
      )}
    </div>
  );
}