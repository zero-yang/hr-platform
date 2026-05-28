import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AppConfig, JobPost, TalentRecord } from "./types";

type JobPostRow = {
  id?: number;
  name: string;
  requirement: string;
  scoring_criteria: string;
};

type TalentPoolRow = {
  id?: number;
  real_name: string;
  phone: string;
  email: string;
  education: string;
  graduate_school: string;
  work_years: number;
  apply_position: string;
  resume_content: string;
  resume_score: number;
  evaluation: string;
  created_at?: string;
  updated_at?: string;
};

function toInteger(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

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
    job: row.name,
    desc: row.requirement,
    scoringCriteria: row.scoring_criteria
  };
}

export function mapTalentRecord(row: TalentPoolRow): TalentRecord {
  return {
    id: row.id,
    name: row.real_name,
    phone: row.phone,
    email: row.email,
    education: row.education,
    school: row.graduate_school,
    workYears: String(row.work_years),
    targetPosition: row.apply_position,
    resumeContent: row.resume_content,
    resumeScore: String(row.resume_score),
    evaluation: row.evaluation,
    createdAt: row.created_at
  };
}

export function toTalentPoolRow(record: TalentRecord): TalentPoolRow {
  return {
    real_name: record.name,
    phone: record.phone,
    email: record.email,
    education: record.education,
    graduate_school: record.school,
    work_years: toInteger(record.workYears),
    apply_position: record.targetPosition,
    resume_content: record.resumeContent,
    resume_score: toInteger(record.resumeScore),
    evaluation: record.evaluation
  };
}

export async function listJobPosts(config: AppConfig): Promise<JobPost[]> {
  const supabase = createBrowserSupabaseClient(config);
  const { data, error } = await supabase
    .from("job_post")
    .select("id, name, requirement, scoring_criteria");

  if (error) {
    throw new Error(`读取岗位失败：${error.message}`);
  }

  return ((data || []) as JobPostRow[]).map(mapJobPost);
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
