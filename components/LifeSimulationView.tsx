import React, { useState } from 'react';
import { Video, Sparkles, Loader2, Play, Clock, Tag, Heart, RotateCcw } from 'lucide-react';
import { Language } from '../types';

interface VideoScene {
  sceneNumber: number;
  setting: string;
  action: string;
  dialogue?: string;
  mood: string;
  duration: string;
}

interface VideoScript {
  title: string;
  description: string;
  scenes: VideoScene[];
  tags: string[];
}

interface LifeSimulationViewProps {
  language: Language;
  onBack?: () => void;
}

export const LifeSimulationView: React.FC<LifeSimulationViewProps> = ({ language, onBack }) => {
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<'short' | 'medium' | 'long'>('medium');
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<VideoScript | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError(language === 'zh' ? '请输入描述' : 'Please enter a description');
      return;
    }

    setLoading(true);
    setError('');
    setScript(null);

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await fetch(`${apiBase}/life-simulation/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
        },
        body: JSON.stringify({
          description: description.trim(),
          language,
          duration,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Generation failed');
      }

      const data = await response.json();
      setScript(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    { text: language === 'zh' ? '乡村教师' : 'Rural Teacher' },
    { text: language === 'zh' ? '大学教授' : 'University Professor' },
    { text: language === 'zh' ? '软件工程师' : 'Software Engineer' },
    { text: language === 'zh' ? '咖啡师' : 'Barista' },
    { text: language === 'zh' ? '医生' : 'Doctor' },
  ];

  const getMoodColor = (mood: string) => {
    const moodLower = mood.toLowerCase();
    if (moodLower.includes('inspiring') || moodLower.includes('激励')) return 'text-purple-400';
    if (moodLower.includes('challenging') || moodLower.includes('挑战')) return 'text-orange-400';
    if (moodLower.includes('peaceful') || moodLower.includes('宁静')) return 'text-blue-400';
    if (moodLower.includes('exciting') || moodLower.includes('激动')) return 'text-cyan-400';
    return 'text-gray-400';
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-500 mb-6 shadow-[0_0_30px_rgba(236,72,153,0.5)]">
          <Video className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
          {language === 'zh' ? 'AI 人生模拟' : 'AI Life Simulation'}
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          {language === 'zh'
            ? '描述您想要体验的人生，AI 将为您生成沉浸式视频脚本'
            : 'Describe the life you want to experience, and AI will generate an immersive video script for you'}
        </p>
      </div>

      {/* Input Section */}
      {!script && (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 mb-8">
          {/* Description Input */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">
              {language === 'zh' ? '您想体验什么样的人生？' : 'What life do you want to experience?'}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                language === 'zh'
                  ? '例如：我想体验一下当老师的生活... 或者：乡村教师、大学教授、咖啡师...'
                  : 'For example: I want to experience life as a teacher... Or: Rural teacher, University professor, Barista...'
              }
              className="w-full h-32 bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all resize-none"
              maxLength={500}
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-slate-500">{description.length}/500</span>
              {error && <span className="text-xs text-red-400">{error}</span>}
            </div>
          </div>

          {/* Suggestions */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">
              {language === 'zh' ? '热门推荐' : 'Popular Suggestions'}
            </label>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setDescription(suggestion.text)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-pink-500 rounded-full text-sm text-slate-300 hover:text-white transition-all"
                >
                  {suggestion.text}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Selection */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">
              {language === 'zh' ? '视频时长' : 'Video Duration'}
            </label>
            <div className="flex gap-3">
              {(['short', 'medium', 'long'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-3 px-4 rounded-xl border transition-all font-bold text-sm ${
                    duration === d
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 border-transparent text-white shadow-lg'
                      : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {language === 'zh' ? (d === 'short' ? '短' : d === 'medium' ? '中' : '长') : d}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !description.trim()}
            className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 hover:from-pink-600 hover:via-purple-600 hover:to-orange-600 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 group"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {language === 'zh' ? '正在生成...' : 'Generating...'}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                {language === 'zh' ? '生成视频脚本' : 'Generate Video Script'}
              </>
            )}
          </button>
        </div>
      )}

      {/* Results Section */}
      {script && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Script Header */}
          <div className="bg-gradient-to-br from-slate-900/90 to-purple-900/20 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h3 className="text-3xl font-black mb-3 text-white">{script.title}</h3>
                <p className="text-slate-400 text-lg">{script.description}</p>
              </div>
              <button
                onClick={() => {
                  setScript(null);
                  setDescription('');
                }}
                className="ml-4 p-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-all"
                title={language === 'zh' ? '重新生成' : 'Regenerate'}
              >
                <RotateCcw className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              {script.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full text-xs font-bold text-purple-400"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Scenes */}
          <div className="space-y-4">
            {script.scenes.map((scene, index) => (
              <div
                key={scene.sceneNumber}
                className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center">
                      <Play className="w-6 h-6 text-pink-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="text-lg font-bold text-white">
                        {language === 'zh' ? '场景' : 'Scene'} {scene.sceneNumber}
                      </h4>
                      <span className={`text-sm font-bold ${getMoodColor(scene.mood)}`}>
                        {scene.mood}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {scene.duration}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {language === 'zh' ? '场景设置' : 'Setting'}
                        </span>
                        <p className="text-slate-300 mt-1">{scene.setting}</p>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {language === 'zh' ? '动作描述' : 'Action'}
                        </span>
                        <p className="text-slate-300 mt-1">{scene.action}</p>
                      </div>

                      {scene.dialogue && (
                        <div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {language === 'zh' ? '对话/独白' : 'Dialogue/Monologue'}
                          </span>
                          <p className="text-slate-300 mt-1 italic">"{scene.dialogue}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setScript(null);
                setDescription('');
              }}
              className="flex-1 py-3 px-6 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {language === 'zh' ? '生成新的' : 'Generate New'}
            </button>
            <button
              onClick={() => alert(language === 'zh' ? '视频制作功能即将推出！' : 'Video production feature coming soon!')}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Heart className="w-5 h-5" />
              {language === 'zh' ? '收藏' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
