"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setStatus('Getting signed URL...');

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
      setStatus('Starting upload...');

      // 2. Cloud Storageへアップロード
      await new Promise<void>((resolve, reject) => {
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
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve();
          } else {
            reject(new Error('Upload failed'));
          }
        };

        // エラーハンドリング
        xhr.onerror = () => {
          reject(new Error('Upload failed'));
        };

        // アップロード実行
        xhr.send(file);
      });

      setStatus('Upload complete, starting processing...');

      // 3. Video AI処理の開始
      const processResponse = await fetch('/api/process-video', {
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
        throw new Error('Failed to start video processing');
      }

      setStatus('Processing started!');

      // 少し待ってから画面遷移
      setTimeout(() => {
        router.push('/videos');
      }, 1000);

    } catch (error) {
      console.error('Error:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
          Video Upload
        </h1>

        <div className="max-w-xl mx-auto">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-6 h-6" />
              Upload Video
            </h2>
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
                    {status} ({Math.round(uploadProgress)}%)
                  </p>
                </div>
              )}
              {status && uploadProgress === 0 && (
                <p className="text-sm text-muted-foreground">{status}</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}