'use client';

import { useState } from 'react';

export default function TestPage() {
  const [status, setStatus] = useState('');
  const [debug, setDebug] = useState<any>({});

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get upload URL: ${errorText}`);
      }

      const { url, filename } = await response.json();
      console.log('Upload URL:', url);
      setDebug({ url, filename });
      setStatus('Got signed URL, starting upload...');

      // 2. Cloud Storageへアップロード
      try {
        const uploadResponse = await fetch(url, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          }
        });

        const responseText = await uploadResponse.text().catch(e => 'No response text');
        console.log('Upload response:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          response: responseText
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: Status ${uploadResponse.status} - ${uploadResponse.statusText} - ${responseText}`);
        }

        setStatus('Upload complete!');
      } catch (uploadError) {
        console.error('Upload specific error:', uploadError);
        setStatus(`Upload error: ${uploadError instanceof Error ? uploadError.message : 'Unknown upload error'}`);
      }
    } catch (error) {
      console.error('General error:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Upload Test</h1>
      <input
        type="file"
        accept="video/*"
        onChange={handleUpload}
        className="mb-4"
      />
      <div className="mt-4">Status: {status}</div>
      <div className="mt-4 text-sm font-mono break-all">
        <h2>Debug Info:</h2>
        <pre>{JSON.stringify(debug, null, 2)}</pre>
      </div>
    </div>
  );
}