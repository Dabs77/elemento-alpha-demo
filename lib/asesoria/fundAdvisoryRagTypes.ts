export type RagProvider = "brainbox" | "local";

export type RagChunk = {
  id: string;
  archivo: string;
  documento: string;
  pageNumber: number;
  titulo?: string;
  text: string;
  source?: RagProvider;
  score?: number;
};

export type FundAdvisoryRagResult = {
  query: string;
  chunks: RagChunk[];
  context: string;
  totalChars: number;
  provider: RagProvider;
  usage?: {
    intelligenceUnitsConsumed?: number;
  };
};
