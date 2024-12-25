"use client";

import { Upload, Search, Play } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function Home() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{
    timestamp: number;
    confidence: number;
    preview: string;
  }>>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ここで実際のアップロード処理を実装
    // 進捗表示のデモとして
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setCurrentVideo(URL.createObjectURL(file));
      }
    }, 500);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    // 実際の検索処理をここに実装
    // デモデータ
    setSearchResults([
      {
        timestamp: 15,
        confidence: 0.85,
        preview: "Content at 0:15",
      },
      {
        timestamp: 45,
        confidence: 0.92,
        preview: "Content at 0:45",
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
          Video Content Search
        </h1>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Upload Section */}
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
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} />
                  <p className="text-sm text-muted-foreground">
                    Processing: {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Search Section */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Search className="w-6 h-6" />
              Search Content
            </h2>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search in video..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit">Search</Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Video Player */}
        {currentVideo && (
          <Card className="mt-8 p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Play className="w-6 h-6" />
              Video Player
            </h2>
            <video
              src={currentVideo}
              controls
              className="w-full rounded-lg"
            ></video>
          </Card>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card className="mt-8 p-6">
            <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
            <div className="space-y-4">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary"
                >
                  <div>
                    <p className="font-medium">{result.preview}</p>
                    <p className="text-sm text-muted-foreground">
                      Confidence: {(result.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const video = document.querySelector("video");
                      if (video) {
                        video.currentTime = result.timestamp;
                        video.play();
                      }
                    }}
                  >
                    Jump to {Math.floor(result.timestamp / 60)}:
                    {(result.timestamp % 60).toString().padStart(2, "0")}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}