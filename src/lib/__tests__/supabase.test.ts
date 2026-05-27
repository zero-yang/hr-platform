import { describe, expect, it } from "vitest";
import { mapJobPost, mapTalentRecord, toTalentPoolRow } from "../supabase";

describe("supabase mappers", () => {
  it("maps job_post rows to app shape", () => {
    expect(mapJobPost({ id: 1, job: "HRBP", desc: "岗位要求", scoring_criteria: "标准" })).toEqual({
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
      work_years: "3.5",
      target_position: "产品经理",
      resume_score: "86"
    });

    expect(mapTalentRecord({ ...row, id: 2, created_at: "2026-05-27T00:00:00Z" })).toMatchObject({
      id: 2,
      workYears: "3.5",
      targetPosition: "产品经理",
      createdAt: "2026-05-27T00:00:00Z"
    });
  });
});
