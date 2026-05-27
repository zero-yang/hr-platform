import { NextResponse } from "next/server";
import { parseJsonObject } from "@/lib/json";

type DeepSeekChoice = {
  message?: {
    content?: string;
  };
};

type DeepSeekResponse = {
  choices?: DeepSeekChoice[];
  error?: {
    message?: string;
  };
};

type DeepSeekRequest = {
  model?: string;
  prompt?: string;
};

export async function POST(request: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "DeepSeek API Key 未配置" }, { status: 500 });
  }

  const body = (await request.json().catch(() => ({}))) as DeepSeekRequest;
  if (!body.model || !body.prompt) {
    return NextResponse.json({ error: "DeepSeek 请求参数不完整" }, { status: 400 });
  }

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: body.model,
      messages: [{ role: "user", content: body.prompt }],
      response_format: { type: "json_object" },
      thinking: { type: "disabled" },
      temperature: 0.2
    })
  });

  const payload = (await response.json().catch(() => ({}))) as DeepSeekResponse;

  if (!response.ok) {
    return NextResponse.json(
      { error: payload.error?.message || `DeepSeek 请求失败：${response.status}` },
      { status: response.status }
    );
  }

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    return NextResponse.json({ error: "DeepSeek 没有返回内容" }, { status: 502 });
  }

  try {
    return NextResponse.json({ data: parseJsonObject(content) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "DeepSeek 返回内容解析失败" },
      { status: 502 }
    );
  }
}
