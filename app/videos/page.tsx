"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Video } from "lucide-react";
import { useEffect, useState } from "react";

interface VideoMetadata {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  createdAt: string;
  labels: string[];
  transcript: string;
  textDetections: string[];
}

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVideos, setFilteredVideos] = useState<VideoMetadata[]>([]);

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [searchQuery, videos]);

  const fetchVideos = async () => {
    try {
      const response = await fetch("/api/videos");
      if (!response.ok) throw new Error("Failed to fetch videos");
      const data = await response.json();
      setVideos(data.videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterVideos = () => {
    if (!searchQuery.trim()) {
      setFilteredVideos(videos);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = videos.filter((video) => {
      const searchableContent = [
        video.originalName.toLowerCase(),
        ...(video.labels || []).map((label) => label.toLowerCase()),
        (video.transcript || "").toLowerCase(),
        ...(video.textDetections || []).map((text) => text.toLowerCase()),
      ].join(" ");

      return searchableContent.includes(query);
    });

    setFilteredVideos(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
            Videos
          </h1>
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              type="search"
              placeholder="Search videos..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))
            : filteredVideos.map((video) => (
              <Card key={video.id} className="overflow-hidden">
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                  <video
                    src={video.url}
                    controls
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-1">
                    {video.originalName}
                  </h3>
                  {video.labels && video.labels.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Labels:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {video.labels.slice(0, 5).map((label, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700"
                          >
                            {label}
                          </span>
                        ))}
                        {video.labels.length > 5 && (
                          <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700">
                            +{video.labels.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>

        {!isLoading && filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No videos found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {videos.length === 0
                ? "Upload your first video to get started"
                : "Try adjusting your search query"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}