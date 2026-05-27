export type AppConfig = {
  supabaseUrl: string;
  supabaseKey: string;
  deepseekModel: string;
};

export type JobPost = {
  id?: number;
  job: string;
  desc: string;
  scoringCriteria: string;
};

export type ResumeInfo = {
  name: string;
  phone: string;
  email: string;
  education: string;
  school: string;
  workYears: string;
  targetPosition: string;
};

export type ResumeScore = {
  score: number;
  evaluation: string;
};

export type TalentRecord = ResumeInfo & {
  id?: number;
  resumeContent: string;
  resumeScore: string;
  evaluation: string;
  createdAt?: string;
};

export type ProcessingResult = TalentRecord & {
  fileName: string;
  status: "success" | "failed";
  error?: string;
};
