import { describe, expect, it } from "vitest";
import { parseJsonObject } from "../json";

describe("parseJsonObject", () => {
  it("parses fenced JSON returned by an LLM", () => {
    expect(parseJsonObject<{ score: number }>("```json\n{\"score\":88}\n```")).toEqual({ score: 88 });
  });

  it("extracts the first JSON object from surrounding text", () => {
    expect(parseJsonObject<{ name: string }>("结果如下：{\"name\":\"李四\"}谢谢")).toEqual({ name: "李四" });
  });

  it("throws for content without a JSON object", () => {
    expect(() => parseJsonObject("没有结构化结果")).toThrow("模型没有返回有效 JSON 对象");
  });
});
