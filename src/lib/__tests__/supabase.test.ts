import { describe, expect, it, vi } from "vitest";
import { listJobPosts, mapJobPost, mapTalentRecord, toTalentPoolRow } from "../supabase";

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn()
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock
}));

describe("supabase mappers", () => {
  it("maps job_post rows to app shape", () => {
    expect(mapJobPost({ id: 1, name: "HRBP", requirement: "岗位要求", scoring_criteria: "标准" })).toEqual({
      id: 1,
      job: "HRBP",
      desc: "岗位要求",
      scoringCriteria: "标准"
    });
  });

  it("maps talent records between app and database shapes", () => {
    const row = toTalentPoolRow({
      name: "王五",
      phone: "13800000000",
      email: "w@example.com",
      education: "本科",
      school: "某大学",
      workYears: "3.5",
      targetPosition: "产品经理",
      resumeContent: "简历",
      resumeScore: "86",
      evaluation: "匹配"
    });

    expect(row).toMatchObject({
      real_name: "王五",
      graduate_school: "某大学",
      work_years: 3,
      apply_position: "产品经理",
      resume_score: 86
    });

    expect(mapTalentRecord({ ...row, id: 2, created_at: "2026-05-27T00:00:00Z" })).toMatchObject({
      id: 2,
      name: "王五",
      school: "某大学",
      workYears: "3",
      targetPosition: "产品经理",
      resumeScore: "86",
      createdAt: "2026-05-27T00:00:00Z"
    });
  });

  it("lists all job posts for AI matching", async () => {
    const select = vi.fn(async () => ({
      data: [
        {
          id: 1,
          name: "高级产品经理",
          requirement: "岗位要求",
          scoring_criteria: "评分标准"
        }
      ],
      error: null
    }));

    const from = vi.fn().mockReturnValueOnce({ select });
    createClientMock.mockReturnValueOnce({ from });

    await expect(
      listJobPosts(
        {
          supabaseUrl: "https://example.supabase.co",
          supabaseKey: "anon",
          deepseekModel: "deepseek-v4-flash"
        }
      )
    ).resolves.toEqual([
      {
        id: 1,
        job: "高级产品经理",
        desc: "岗位要求",
        scoringCriteria: "评分标准"
      }
    ]);
    expect(from).toHaveBeenCalledWith("job_post");
    expect(select).toHaveBeenCalledWith("id, name, requirement, scoring_criteria");
  });
});
