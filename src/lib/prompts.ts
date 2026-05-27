import type { JobPost } from "./types";

export function buildResumeExtractPrompt(resumeContent: string): string {
  return `# 角色
你是一位资深HR招聘专家，请从提供的简历内容中提取结构化信息。请严格按照JSON格式输出，确保信息完整准确：
# 要求
1. 所有字段都必须填写，如果简历中没有对应信息，填写"未提供"
2. 工作时间需要计算总年限，如：2年3个月计算为2.3年
3. 学历信息按最高学历提取

# 简历
${resumeContent}

# 输出要求
请严格按照以下 JSON 格式输出，不要输出任何其他内容：
{
  "name": "姓名",
  "phone": "电话",
  "email": "邮箱",
  "education": "学历（如：本科、硕士、博士）",
  "school": "毕业学校全称",
  "workYears": "工作年限（如：3.5表示3年5个月）",
  "targetPosition": "求职岗位"
}
`;
}

export function buildResumeScorePrompt(jobInfo: JobPost, resumeContent: string): string {
  return `# 角色
你是一位资深HR招聘专家，具备5年以上人才评估经验，擅长通过标准化评分体系精准匹配候选人与岗位需求，
能客观量化简历竞争力并提供结构化面试建议。
# 评分原则
1. 基于简历事实，避免主观猜测
2. 重点考察与当前岗位的相关性
3. 对于技术能力，不仅要看"用过什么"，更要看"用得多深"
4. 对于项目经验，关注业务理解和技术贡献
5. 综合评估，避免单一维度决定

# 岗位
${jobInfo.job}

# 岗位要求
${jobInfo.desc}

# 评分标准
${jobInfo.scoringCriteria}

# 候选人简历
${resumeContent}

# 输出要求
请严格按照以下 JSON 格式输出，不要输出任何其他内容：
{
  "score": 0-100的整数评分,
  "evaluation": "详细的评价总结，包括优势、不足和面试建议（200-500字）"
}
`;
}
