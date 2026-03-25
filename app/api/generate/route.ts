import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const client = new Anthropic({ apiKey });
  const { state } = await req.json();

  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      system: `あなたは文明シミュレータのAIエンジンです。与えられた文明の状態を元に、次に起こるイベント・発見・物語を生成してください。

舞台の前提（描写に織り込むこと。史実の年表をなぞらない）:
- 気候・地形は関西盆地と瀬戸内海沿岸に似た世界。夏は湿気と夕立、冬は乾いた風が吹く盆地。塩・漁・港と川舟の交易、山裾からの炭・木材、田と畑の細かい区画が生活の骨格になる。
- 集落名はすでに近畿の地理に着想を得た呼び方が多い。イベント文では港・河・山裾・盆地という具体像を一つ以上入れるとよい。
- 現代の企業名・路線名・商標の列挙は避ける。方言は必要なら軽く添える程度にし、過剰なギャグ調・ステレオタイプ化は避ける。

ルール:
- 人類の歴史をなぞるな。この文明は独自の進化を遂げる
- 始祖の気質と文明の目標が進化の方向性に強く影響する
- 創造主（ユーザー）の信条も文明に反映される
- 具体的で生き生きとした描写をせよ
- 必ずJSON形式で返せ`,
      messages: [
        {
          role: "user",
          content: `現在の文明状態:
- 年代: ${state.year}
- 時代: ${state.era}
- 人口: ${state.pop}
- 始祖α: ${state.adam}（${state.adamT}）
- 始祖β: ${state.eve}（${state.eveT}）
- 文明の目標: ${state.goal}
- 創造主の信条: ${state.creatorTrait}
- 既存の発見: ${state.techs.join(", ") || "なし"}
- 集落: ${state.settlements.join(", ") || "なし"}
- 世代: 第${state.generation}世代

以下のJSON形式で3つのイベントを生成せよ:
{
  "events": [
    {"type": "event"|"discovery"|"story", "title": "短いタイトル", "text": "詳細な描写（1-2文）", "impact": "positive"|"negative"|"neutral"}
  ],
  "newDiscovery": "この文明独自の発見（あれば。なければnull）",
  "storyFragment": "創造主（ユーザー）の人生に関連する短い物語"
}`,
        },
      ],
    });

    const content = (msg.content[0] as { type: "text"; text: string }).text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return NextResponse.json(JSON.parse(jsonMatch[0]));
    }
    return NextResponse.json({
      events: [
        { type: "event", title: "時の流れ", text: content.slice(0, 100), impact: "neutral" },
      ],
      newDiscovery: null,
      storyFragment: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
