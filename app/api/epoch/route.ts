import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const client = new Anthropic({ apiKey });
  const { state, newEra } = await req.json();

  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      system:
        "文明シミュレータのAIエンジン。新時代突入時の壮大な演出テキストを生成する。",
      messages: [
        {
          role: "user",
          content: `文明「${state.adam}と${state.eve}の末裔」が「${newEra}」に突入した。
目標:「${state.goal}」、人口:${state.pop}、発見:${state.techs.join(",")}
この転換点を壮大に描写せよ。JSON: {"title":"タイトル","subtitle":"サブタイトル","description":"3文以内の描写"}`,
        },
      ],
    });

    const content = (msg.content[0] as { type: "text"; text: string }).text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return NextResponse.json(
      jsonMatch
        ? JSON.parse(jsonMatch[0])
        : { title: newEra, subtitle: "新たな時代", description: "" }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
