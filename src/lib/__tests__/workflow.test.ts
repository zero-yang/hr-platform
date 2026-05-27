import { beforeEach, describe, expect, it, vi } from "vitest";
import { processResumeFile } from "../workflow";

vi.mock("../pdf", () => ({
  readPdfText: vi.fn(async () => "候选人简历内容")
}));

vi.mock("../supabase", () => ({
  findJobPost: vi.fn(async () => ({
    job: "前端工程师",
    desc: "熟悉 React",
    scoringCriteria: "项目经验 50 分"
  })),
  insertTalentRecord: vi.fn(async (config, record) => ({
    id: 1,
    ...record,
    createdAt: "2026-05-27T00:00:00Z"
  }))
}));

vi.mock("../deepseek", () => ({
  extractResumeInfo: vi.fn(async () => ({
    name: "赵六",
    phone: "13900000000",
    email: "z@example.com",
    education: "本科",
    school: "测试大学",
    workYears: "4",
    targetPosition: "未提供"
  })),
  scoreResume: vi.fn(async () => ({
    score: 91,
    evaluation: "候选人与岗位高度匹配，建议进入面试。"
  }))
}));

describe("processResumeFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads, extracts, scores and saves a resume", async () => {
    const file = new File(["pdf"], "resume.pdf", { type: "application/pdf" });

    const result = await processResumeFile(
      {
        supabaseUrl: "https://example.supabase.co",
        supabaseKey: "anon",
        deepseekModel: "deepseek-v4-flash"
      },
      file,
      "前端工程师"
    );

    expect(result).toMatchObject({
      id: 1,
      fileName: "resume.pdf",
      status: "success",
      name: "赵六",
      targetPosition: "前端工程师",
      resumeScore: "91",
      resumeContent: "候选人简历内容"
    });
  });
});
