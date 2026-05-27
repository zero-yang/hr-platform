import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AppConfig, JobPost, TalentRecord } from "./types";

type JobPostRow = {
  id?: number;
  job: string;
  desc: string;
  scoring_criteria: string;
};

type TalentPoolRow = {
  id?: number;
  name: string;
  phone: string;
  email: string;
  education: string;
  school: string;
  work_years: string;
  target_position: string;
  resume_content: string;
  resume_score: string;
  evaluation: string;
  created_at?: string;
};

export function createBrowserSupabaseClient(config: AppConfig): SupabaseClient {
  return createClient(config.supabaseUrl, config.supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export function mapJobPost(row: JobPostRow): JobPost {
  return {
    id: row.id,
    job: row.job,
    desc: row.desc,
    scoringCriteria: row.scoring_criteria
  };
}

export function mapTalentRecord(row: TalentPoolRow): TalentRecord {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    education: row.education,
    school: row.school,
    workYears: row.work_years,
    targetPosition: row.target_position,
    resumeContent: row.resume_content,
    resumeScore: row.resume_score,
    evaluation: row.evaluation,
    createdAt: row.created_at
  };
}

export function toTalentPoolRow(record: TalentRecord): TalentPoolRow {
  return {
    name: record.name,
    phone: record.phone,
    email: record.email,
    education: record.education,
    school: record.school,
    work_years: record.workYears,
    target_position: record.targetPosition,
    resume_content: record.resumeContent,
    resume_score: record.resumeScore,
    evaluation: record.evaluation
  };
}

export async function findJobPost(config: AppConfig, jobName: string): Promise<JobPost> {
  const supabase = createBrowserSupabaseClient(config);
  const { data, error } = await supabase
    .from("job_post")
    .select("id, job, desc, scoring_criteria")
    .eq("job", jobName)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`读取岗位失败：${error.message}`);
  }

  if (!data) {
    throw new Error(`岗位表中没有找到「${jobName}」`);
  }

  return mapJobPost(data as JobPostRow);
}

export async function insertTalentRecord(config: AppConfig, record: TalentRecord): Promise<TalentRecord> {
  const supabase = createBrowserSupabaseClient(config);
  const { data, error } = await supabase
    .from("talent_pool")
    .insert(toTalentPoolRow(record))
    .select("*")
    .single();

  if (error) {
    throw new Error(`保存人才记录失败：${error.message}`);
  }

  return mapTalentRecord(data as TalentPoolRow);
}

export async function listTalentRecords(config: AppConfig): Promise<TalentRecord[]> {
  const supabase = createBrowserSupabaseClient(config);
  const { data, error } = await supabase
    .from("talent_pool")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`读取历史记录失败：${error.message}`);
  }

  return ((data || []) as TalentPoolRow[]).map(mapTalentRecord);
}
