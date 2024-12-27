export interface Video {
  id: string;
  title: string;
  url: string;
  createdAt: string;
  status: 'processing' | 'completed' | 'error';
}

export interface SearchResult {
  timestamp: number;
  confidence: number;
  preview: string;
}