"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { SearchResult, Video } from "@/lib/types";
import { Play, Search } from "lucide-react";
import { useState } from "react";

export default function VideosPage() {
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // デモ用の動画一覧
  const videos: Video[] = [
    {
      id: "1",
      title: "Sample Video 1",
      url: "/sample1.mp4",
      createdAt: "2024-01-01",
      status: "completed"
    },
    {
      id: "2",
      title: "Sample Video 2",
      url: "/sample2.mp4",
      createdAt: "2024-01-02",
      status: "processing"
    }
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVideo) return;

    // 実際の検索処理をここに実装
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
          My Videos
        </h1>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Video List */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Video Library</h2>
            <div className="space-y-4">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary cursor-pointer hover:bg-secondary/80"
                  onClick={() => setCurrentVideo(video)}
                >
                  <div>
                    <p className="font-medium">{video.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {video.createdAt}
                    </p>
                  </div>
                  <div className="text-sm font-medium">
                    {video.status === "processing" ? (
                      <span className="text-yellow-500">Processing</span>
                    ) : (
                      <span className="text-green-500">Ready</span>
                    )}
                  </div>
                </div>
              ))}
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
                  disabled={!currentVideo}
                />
                <Button type="submit" disabled={!currentVideo}>
                  Search
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Video Player */}
        {currentVideo && (
          <Card className="mt-8 p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Play className="w-6 h-6" />
              {currentVideo.title}
            </h2>
            <video
              src={currentVideo.url}
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