export interface MatchedSegment {
  text: string;
  sourceId: number;
  similarity: number;
}

export interface MatchedSource {
  id: number;
  name: string;
  type: 'Internet Source' | 'Publication' | 'Student Paper' | string;
  percent: number;
  url: string;
  color: string;
}

export interface ParagraphAnalysis {
  index: number;
  originalText: string;
  similarityScore: number;
  isPlagiarized: boolean;
  primarySourceId?: number;
  paraphrasePriority: 'Tinggi (Kritis)' | 'Sedang' | 'Rendah' | 'Bersih' | string;
  impactDescription: string;
  suggestedParaphrase: string;
  paraphraseExplanation: string;
  matchedSegments?: MatchedSegment[];
  // State for user actions
  userRevisedText?: string;
  isAccepted?: boolean;
}

export interface SimilarityBreakdown {
  internetSources: number;
  publications: number;
  studentPapers: number;
}

export interface TurnitinReport {
  documentTitle: string;
  documentAuthor: string;
  institution: string;
  submissionId: string;
  checkDate: string;
  wordCount: number;
  characterCount: number;
  pageCountEstimate?: number;
  overallSimilarity: number;
  similarityBreakdown: SimilarityBreakdown;
  sources: MatchedSource[];
  paragraphs: ParagraphAnalysis[];
  summaryVerdict: string;
  safeTargetEstimate: number;
}

export interface CheckOptions {
  title: string;
  author: string;
  institution: string;
  excludeQuotes: boolean;
  excludeBibliography: boolean;
  excludeSmallMatches: number;
  documentType: 'skripsi_tesis' | 'jurnal' | 'esai_artikel';
}
