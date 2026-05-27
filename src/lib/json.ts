export function parseJsonObject<T>(content: string): T {
  const cleaned = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new Error("模型没有返回有效 JSON 对象");
  }

  return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as T;
}
