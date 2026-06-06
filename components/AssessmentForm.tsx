
import React, { useState } from 'react';
import { UserProfile, Language } from '../types';
import { Button } from './Button';
import { Plus, X, Zap, Gamepad2, Sparkles, Cpu } from 'lucide-react';

interface AssessmentFormProps {
  onSubmit: (profile: UserProfile) => void;
  isLoading: boolean;
  language: Language;
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({ onSubmit, isLoading, language }) => {
  const isZh = language === 'zh';
  const t = {
    title: isZh ? "SOUL SCAN" : "SOUL SCAN",
    subtitle: isZh ? "初始化您的数字替身。这不是问卷，这是您的角色卡。" : "Initialize your digital avatar. This isn't a survey, it's your character sheet.",
    nameLabel: isZh ? "玩家代号 (Name)" : "Player Callsign",
    namePlace: isZh ? "输入您的昵称" : "Enter your nickname",
    classLabel: isZh ? "当前职业/专业 (Class)" : "Current Class/Major",
    classPlace: isZh ? "例如：大二设计系 / 1年经验运营" : "e.g. Design Student / Jr. Marketing",
    hiddenLabel: isZh ? "隐藏数据 (Hobbies & Fragments)" : "Hidden Data (Hobbies & Fragments)",
    hiddenDesc: isZh ? "输入您平时的生活碎片：爱看的B站分区、常玩的游戏、或是周末的小怪癖。" : "Input your life fragments: Favorite YouTube genres, games you play, or weird habits.",
    hiddenPlace: isZh ? "例如：原神60级、喜欢看修蹄子视频..." : "e.g. Lvl 60 Genshin, love watching restoration videos...",
    realityLabel: isZh ? "自我觉察 (Reality Check)" : "Reality Check",
    realityPlace: isZh ? "您觉得自己最大的天赋是什么？或者最想吐槽自己的缺点？（AI 会将其计入属性点）" : "What's your biggest talent? Or your biggest flaw? (AI will calculate stats based on this)",
    submit: isZh ? "启动 FutureCraft 系统" : "Launch FutureCraft System",
    loading: isZh ? "正在生成数字孪生..." : "Generating Digital Twin..."
  };

  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    major: '',
    hobbies: [],
    hiddenTalent: '',
  });
  const [currentHobby, setCurrentHobby] = useState('');

  const addHobby = () => {
    if (currentHobby.trim()) {
      setProfile(p => ({ ...p, hobbies: [...p.hobbies, currentHobby.trim()] }));
      setCurrentHobby('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(profile);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-4 bg-cyan-500/10 rounded-full mb-4 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
          <Cpu className="w-10 h-10 text-cyan-400" />
        </div>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-tight mb-2">
          {t.title}
        </h1>
        <p className="text-slate-400 text-lg">{t.subtitle}</p>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 blur-[100px] pointer-events-none"></div>

        <form onSubmit={handleSubmit} className="relative space-y-8 z-10">
          
          {/* Section 1: Identity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 group">
              <label className="flex items-center text-sm font-bold text-cyan-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 mr-2" /> {t.nameLabel}
              </label>
              <input
                type="text"
                required
                className="w-full bg-black/40 border border-slate-600 rounded-xl px-4 py-4 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all group-hover:border-slate-500 placeholder:text-slate-600"
                placeholder={t.namePlace}
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="space-y-2 group">
              <label className="flex items-center text-sm font-bold text-purple-400 uppercase tracking-wider">
                <Zap className="w-4 h-4 mr-2" /> {t.classLabel}
              </label>
              <input
                type="text"
                required
                className="w-full bg-black/40 border border-slate-600 rounded-xl px-4 py-4 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all group-hover:border-slate-500 placeholder:text-slate-600"
                placeholder={t.classPlace}
                value={profile.major}
                onChange={e => setProfile({ ...profile, major: e.target.value })}
              />
            </div>
          </div>

          {/* Section 2: Hidden Data */}
          <div className="space-y-4">
            <label className="flex items-center text-sm font-bold text-pink-400 uppercase tracking-wider">
              <Gamepad2 className="w-4 h-4 mr-2" /> {t.hiddenLabel}
            </label>
            <p className="text-xs text-slate-500 -mt-3">{t.hiddenDesc}</p>
            
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 bg-black/40 border border-slate-600 rounded-xl px-4 py-4 text-white focus:ring-2 focus:ring-pink-500 outline-none placeholder:text-slate-600"
                placeholder={t.hiddenPlace}
                value={currentHobby}
                onChange={e => setCurrentHobby(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addHobby())}
              />
              <Button type="button" variant="secondary" onClick={addHobby} className="bg-slate-800 hover:bg-slate-700 text-pink-400 border border-slate-600">
                <Plus className="w-6 h-6"/>
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {profile.hobbies.map((hobby, idx) => (
                <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-pink-500/10 text-pink-300 text-sm border border-pink-500/30 backdrop-blur-md">
                  {hobby}
                  <button type="button" onClick={() => setProfile(p => ({ ...p, hobbies: p.hobbies.filter((_, i) => i !== idx) }))} className="ml-2 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Section 3: Reality Check */}
          <div className="space-y-2">
             <label className="flex items-center text-sm font-bold text-yellow-400 uppercase tracking-wider">
                {t.realityLabel}
             </label>
             <textarea
                required
                className="w-full bg-black/40 border border-slate-600 rounded-xl px-4 py-4 text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none min-h-[100px] placeholder:text-slate-600"
                placeholder={t.realityPlace}
                value={profile.hiddenTalent}
                onChange={e => setProfile({ ...profile, hiddenTalent: e.target.value })}
             />
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full py-5 text-lg font-bold bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 border-none shadow-lg shadow-cyan-500/20" 
              isLoading={isLoading}
            >
              {isLoading ? t.loading : t.submit}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
