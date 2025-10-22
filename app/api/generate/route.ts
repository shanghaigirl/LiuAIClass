import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { input, intensity } = await request.json();

    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return NextResponse.json(
        { error: '请输入对方说的话' },
        { status: 400 }
      );
    }

    if (typeof intensity !== 'number' || intensity < 1 || intensity > 10) {
      return NextResponse.json(
        { error: '语气强度必须在1-10之间' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: '服务配置错误' },
        { status: 500 }
      );
    }

    const intensityDescriptions: Record<number, string> = {
      1: '温和委婉',
      2: '礼貌但坚定',
      3: '直接明了',
      4: '略带不满',
      5: '明显不悦',
      6: '强硬反驳',
      7: '犀利反击',
      8: '激烈对抗',
      9: '凌厉攻势',
      10: '绝对碾压'
    };

    const intensityDesc = intensityDescriptions[intensity] || '适中';

    const prompt = `你是一位语言大师，擅长用逻辑清晰、有力度的语言进行反驳和回应。

对方说："${input}"

请根据语气强度「${intensity}/10（${intensityDesc}）」生成3条回怼语句。要求：
1. 每条回应要有逻辑性，能够指出对方话语的漏洞或进行有效反驳
2. 根据语气强度调整攻击性和措辞锋利度
3. 回应要简短有力，每条不超过50字
4. 三条回应的角度要有所不同

请直接输出3条回应，每条单独一行，不要加序号或额外说明。`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': '吵架包赢'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-preview-09-2025',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenRouter API error:', errorData);
      return NextResponse.json(
        { error: '生成失败，请稍后重试' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: '生成内容为空' },
        { status: 500 }
      );
    }

    const responses = content
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .slice(0, 3);

    if (responses.length === 0) {
      return NextResponse.json(
        { error: '未能生成有效回应' },
        { status: 500 }
      );
    }

    return NextResponse.json({ responses });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}
