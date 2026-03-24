import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

let client = null;

// APIキー設定
app.post('/api/init', (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ error: 'API key required' });
  client = new Anthropic({ apiKey });
  res.json({ ok: true });
});

// 文明イベント生成
app.post('/api/generate', async (req, res) => {
  if (!client) return res.status(400).json({ error: 'API not initialized' });

  const { state } = req.body;
  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      system: `あなたは文明シミュレータのAIエンジンです。与えられた文明の状態を元に、次に起こるイベント・発見・物語を生成してください。

ルール:
- 人類の歴史をなぞるな。この文明は独自の進化を遂げる
- 始祖の気質と文明の目標が進化の方向性に強く影響する
- 創造主（ユーザー）の信条も文明に反映される
- 具体的で生き生きとした描写をせよ
- 必ずJSON形式で返せ`,
      messages: [{
        role: 'user',
        content: `現在の文明状態:
- 年代: ${state.year}
- 時代: ${state.era}
- 人口: ${state.pop}
- 始祖α: ${state.adam}（${state.adamT}）
- 始祖β: ${state.eve}（${state.eveT}）
- 文明の目標: ${state.goal}
- 創造主の信条: ${state.creatorTrait}
- 既存の発見: ${state.techs.join(', ') || 'なし'}
- 集落: ${state.settlements.join(', ') || 'なし'}
- 世代: 第${state.generation}世代

以下のJSON形式で3つのイベントを生成せよ:
{
  "events": [
    {"type": "event"|"discovery"|"story", "title": "短いタイトル", "text": "詳細な描写（1-2文）", "impact": "positive"|"negative"|"neutral"}
  ],
  "newDiscovery": "この文明独自の発見（あれば。なければnull）",
  "storyFragment": "創造主（ユーザー）の人生に関連する短い物語"
}`
      }]
    });

    const content = msg.content[0].text;
    // JSONを抽出
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      res.json(JSON.parse(jsonMatch[0]));
    } else {
      res.json({ events: [{ type: 'event', title: '時の流れ', text: content.slice(0, 100), impact: 'neutral' }], newDiscovery: null, storyFragment: null });
    }
  } catch (err) {
    console.error('API error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 文明の大転換点
app.post('/api/epoch', async (req, res) => {
  if (!client) return res.status(400).json({ error: 'API not initialized' });

  const { state, newEra } = req.body;
  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      system: '文明シミュレータのAIエンジン。新時代突入時の壮大な演出テキストを生成する。',
      messages: [{
        role: 'user',
        content: `文明「${state.adam}と${state.eve}の末裔」が「${newEra}」に突入した。
目標:「${state.goal}」、人口:${state.pop}、発見:${state.techs.join(',')}
この転換点を壮大に描写せよ。JSON: {"title":"タイトル","subtitle":"サブタイトル","description":"3文以内の描写"}`
      }]
    });
    const content = msg.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    res.json(jsonMatch ? JSON.parse(jsonMatch[0]) : { title: newEra, subtitle: '新たな時代', description: '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3456;
app.listen(PORT, () => console.log(`Genesis server running: http://localhost:${PORT}`));
