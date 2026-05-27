import { extractResumeInfo, scoreResume } from "./deepseek";
import { readPdfText } from "./pdf";
import { findJobPost, insertTalentRecord } from "./supabase";
import type { AppConfig, ProcessingResult, TalentRecord } from "./types";

export async function processResumeFile(
  config: AppConfig,
  file: File,
  jobName: string,
  cachedJob?: Awaited<ReturnType<typeof findJobPost>>
): Promise<ProcessingResult> {
  try {
    const resumeContent = await readPdfText(file);
    const jobInfo = cachedJob || (await findJobPost(config, jobName));
    const basicInfo = await extractResumeInfo(config, resumeContent);
    const scoreInfo = await scoreResume(config, jobInfo, resumeContent);

    const record: TalentRecord = {
      ...basicInfo,
      targetPosition: basicInfo.targetPosition === "未提供" ? jobName : basicInfo.targetPosition,
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
      targetPosition: jobName,
      resumeContent: "",
      resumeScore: "0",
      evaluation: "处理失败"
    };
  }
}
