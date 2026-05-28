import { describe, expect, it } from "vitest";
import { buildJobMatchPrompt, buildResumeExtractPrompt, buildResumeScorePrompt } from "../prompts";

describe("prompt builders", () => {
  it("fills the resume content in the extract prompt", () => {
    const prompt = buildResumeExtractPrompt("张三，5年 Java 经验");

    expect(prompt).toContain("# 简历\n张三，5年 Java 经验");
    expect(prompt).toContain('"workYears"');
    expect(prompt).toContain("不要输出任何其他内容");
  });

  it("fills job information and resume content in the score prompt", () => {
    const prompt = buildResumeScorePrompt(
      {
        job: "前端工程师",
        desc: "熟悉 React 和工程化",
        scoringCriteria: "React 40分，项目经验 40分，沟通 20分"
      },
      "候选人熟悉 Next.js"
    );

    expect(prompt).toContain("# 岗位\n前端工程师");
    expect(prompt).toContain("# 岗位要求\n熟悉 React 和工程化");
    expect(prompt).toContain("# 评分标准\nReact 40分");
    expect(prompt).toContain("# 候选人简历\n候选人熟悉 Next.js");
  });

  it("builds a job match prompt with numbered candidates", () => {
    const prompt = buildJobMatchPrompt("产品经理", [
      {
        id: 1,
        job: "高级产品经理",
        desc: "负责医疗 AI 产品规划",
        scoringCriteria: "产品经验 50分"
      },
      {
        id: 2,
        job: "前端工程师",
        desc: "负责 Web 前端开发",
        scoringCriteria: "React 50分"
      }
    ]);

    expect(prompt).toContain("# 简历提取出的求职岗位\n产品经理");
    expect(prompt).toContain("候选编号：1");
    expect(prompt).toContain("岗位名称：高级产品经理");
    expect(prompt).toContain('"candidateNumber"');
  });
});
