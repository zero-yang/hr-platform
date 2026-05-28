import { beforeEach, describe, expect, it, vi } from "vitest";
import { extractResumeInfo, matchJobPost, scoreResume } from "../deepseek";
import { insertTalentRecord, listJobPosts } from "../supabase";
import { processResumeFile } from "../workflow";

vi.mock("../pdf", () => ({
  readPdfText: vi.fn(async () => "候选人简历内容")
}));

vi.mock("../supabase", () => ({
  listJobPosts: vi.fn(async () => [
    {
      id: 1,
      job: "高级产品经理",
      desc: "负责医疗 AI 产品规划",
      scoringCriteria: "产品经验 50 分"
    }
  ]),
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
  matchJobPost: vi.fn(async () => ({
    id: 1,
    job: "高级产品经理",
    desc: "负责医疗 AI 产品规划",
    scoringCriteria: "产品经验 50 分"
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

  it("uses AI to match the extracted target position against all job posts", async () => {
    const file = new File(["pdf"], "resume.pdf", { type: "application/pdf" });
    vi.mocked(extractResumeInfo).mockResolvedValueOnce({
      name: "赵六",
      phone: "13900000000",
      email: "z@example.com",
      education: "本科",
      school: "测试大学",
      workYears: "4",
      targetPosition: "产品经理"
    });

    const result = await processResumeFile(
      {
        supabaseUrl: "https://example.supabase.co",
        supabaseKey: "anon",
        deepseekModel: "deepseek-v4-flash"
      },
      file
    );

    expect(listJobPosts).toHaveBeenCalledWith(expect.any(Object));
    expect(matchJobPost).toHaveBeenCalledWith(
      expect.any(Object),
      "产品经理",
      expect.arrayContaining([expect.objectContaining({ job: "高级产品经理" })])
    );
    expect(scoreResume).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ job: "高级产品经理" }),
      "候选人简历内容"
    );
    expect(insertTalentRecord).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({ targetPosition: "产品经理" }));
    expect(result).toMatchObject({
      id: 1,
      fileName: "resume.pdf",
      status: "success",
      name: "赵六",
      targetPosition: "产品经理",
      resumeScore: "91",
      resumeContent: "候选人简历内容"
    });
  });

  it("returns a permission-oriented error when job posts are empty", async () => {
    const file = new File(["pdf"], "resume.pdf", { type: "application/pdf" });
    vi.mocked(extractResumeInfo).mockResolvedValueOnce({
      name: "赵六",
      phone: "13900000000",
      email: "z@example.com",
      education: "本科",
      school: "测试大学",
      workYears: "4",
      targetPosition: "产品经理"
    });
    vi.mocked(listJobPosts).mockResolvedValueOnce([]);

    const result = await processResumeFile(
      {
        supabaseUrl: "https://example.supabase.co",
        supabaseKey: "anon",
        deepseekModel: "deepseek-v4-flash"
      },
      file
    );

    expect(matchJobPost).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      status: "failed",
      error: expect.stringContaining("RLS")
    });
  });
});
