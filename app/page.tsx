'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export default function Home() {
  const [input, setInput] = useState('');
  const [intensity, setIntensity] = useState([5]);
  const [responses, setResponses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const intensityLabels: Record<number, string> = {
    1: '温和委婉',
    2: '礼貌坚定',
    3: '直接明了',
    4: '略带不满',
    5: '明显不悦',
    6: '强硬反驳',
    7: '犀利反击',
    8: '激烈对抗',
    9: '凌厉攻势',
    10: '绝对碾压'
  };

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError('请输入对方说的话');
      return;
    }

    setLoading(true);
    setError('');
    setResponses([]);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: input.trim(),
          intensity: intensity[0]
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '生成失败');
      }

      setResponses(data.responses || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="min-h-screen bg-[#ededed] flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800 text-center">吵架包赢</h1>
      </header>

      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        <Card className="mb-6 shadow-sm border-gray-200">
          <CardContent className="p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              对方说的话
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入对方说的话..."
              className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#07C160] focus:border-transparent text-base"
            />

            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-gray-700">
                  语气强度
                </label>
                <span className="text-sm font-semibold text-[#07C160]">
                  {intensity[0]} - {intensityLabels[intensity[0]]}
                </span>
              </div>
              <Slider
                value={intensity}
                onValueChange={setIntensity}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>温和</span>
                <span>强硬</span>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full mt-6 h-11 bg-[#07C160] hover:bg-[#06ad56] text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '生成中...' : '开始吵架'}
            </Button>
          </CardContent>
        </Card>

        {responses.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-gray-600 px-2">回怼语句：</h2>
            {responses.map((response, index) => (
              <Card key={index} className="shadow-sm border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#07C160] text-white flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </div>
                    <p className="flex-1 text-gray-800 leading-relaxed">{response}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-gray-600 px-2">生成中...</h2>
            {[1, 2, 3].map((i) => (
              <Card key={i} className="shadow-sm border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 px-4 py-3 text-center text-xs text-gray-500">
        © 2025 吵架包赢 · 仅供娱乐，请理性沟通
      </footer>
    </div>
  );
}
