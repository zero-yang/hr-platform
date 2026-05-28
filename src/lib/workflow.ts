import { extractResumeInfo, matchJobPost, scoreResume } from "./deepseek";
import { readPdfText } from "./pdf";
import { insertTalentRecord, listJobPosts } from "./supabase";
import type { AppConfig, JobPost, ProcessingResult, TalentRecord } from "./types";

export async function processResumeFile(
  config: AppConfig,
  file: File,
  cachedJob?: JobPost
): Promise<ProcessingResult> {
  try {
    const resumeContent = await readPdfText(file);
    const basicInfo = await extractResumeInfo(config, resumeContent);
    const jobName = basicInfo.targetPosition;
    if (!jobName || jobName === "未提供") {
      throw new Error("简历中未提取到求职岗位，无法匹配岗位要求");
    }

    const jobPosts = cachedJob ? [cachedJob] : await listJobPosts(config);
    if (jobPosts.length === 0) {
      throw new Error("岗位表查询结果为空，请检查 Supabase 项目环境变量是否正确，以及 job_post 表是否允许当前 anon/publishable 角色读取（RLS select policy）。");
    }

    const jobInfo = cachedJob || (await matchJobPost(config, jobName, jobPosts));
    const scoreInfo = await scoreResume(config, jobInfo, resumeContent);

    const record: TalentRecord = {
      ...basicInfo,
      targetPosition: jobName,
      resumeContent,
      resumeScore: String(scoreInfo.score),
      evaluation: scoreInfo.evaluation
    };

    const saved = await insertTalentRecord(config, record);

    return {
      ...saved,
      fileName: file.name,
      status: "success"
    };
  } catch (error) {
    return {
      fileName: file.name,
      status: "failed",
      error: error instanceof Error ? error.message : "处理失败",
      name: "未提供",
      phone: "未提供",
      email: "未提供",
      education: "未提供",
      school: "未提供",
      workYears: "未提供",
      targetPosition: "未提供",
      resumeContent: "",
      resumeScore: "0",
      evaluation: "处理失败"
    };
  }
}
