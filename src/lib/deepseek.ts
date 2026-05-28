import { buildJobMatchPrompt, buildResumeExtractPrompt, buildResumeScorePrompt } from "./prompts";
import type { AppConfig, JobPost, ResumeInfo, ResumeScore } from "./types";

type DeepSeekResponse = {
  data?: unknown;
  error?: string;
};

type JobPostMatch = {
  candidateNumber: number;
  reason?: string;
};

async function callDeepSeekJson<T>(config: AppConfig, prompt: string): Promise<T> {
  const response = await fetch("/api/deepseek", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: config.deepseekModel,
      prompt
    })
  });

  const payload = (await response.json().catch(() => ({}))) as DeepSeekResponse;

  if (!response.ok) {
    throw new Error(payload.error || `DeepSeek 请求失败：${response.status}`);
  }

  if (!payload.data) {
    throw new Error("DeepSeek 没有返回内容");
  }

  return payload.data as T;
}

export function extractResumeInfo(config: AppConfig, resumeContent: string): Promise<ResumeInfo> {
  return callDeepSeekJson<ResumeInfo>(config, buildResumeExtractPrompt(resumeContent));
}

export async function matchJobPost(config: AppConfig, targetPosition: string, jobPosts: JobPost[]): Promise<JobPost> {
  if (jobPosts.length === 0) {
    throw new Error("岗位表中没有可匹配的岗位");
  }

  const match = await callDeepSeekJson<JobPostMatch>(config, buildJobMatchPrompt(targetPosition, jobPosts));
  const candidateIndex = Number(match.candidateNumber) - 1;
  const matchedJobPost = jobPosts[candidateIndex];

  if (!Number.isInteger(candidateIndex) || !matchedJobPost) {
    throw new Error("AI 未能从岗位表中匹配到有效岗位");
  }

  return matchedJobPost;
}

export function scoreResume(config: AppConfig, jobInfo: JobPost, resumeContent: string): Promise<ResumeScore> {
  return callDeepSeekJson<ResumeScore>(config, buildResumeScorePrompt(jobInfo, resumeContent));
}
