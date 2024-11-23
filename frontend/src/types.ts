export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  abstract: string;
  accuracy: number;
  perspective: string;
  url: string;
}

export interface ResearchPoint {
  id: string;
  topic: string;
  supportingPapers: ResearchPaper[];
  opposingPapers: ResearchPaper[];
}