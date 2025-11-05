
export interface MatchResult {
  region_name: string;
  country: string;
  latitude: number;
  longitude: number;
  description: string;
  similarity_score: number;
  satellite_image_url: string;
}

export interface AnalysisResult {
  summary: string;
  matches: MatchResult[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}
