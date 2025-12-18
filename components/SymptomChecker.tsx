import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeSymptoms } from '../services/geminiService';
import { Bot, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { DEPARTMENTS } from '../constants';

export const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ departmentId: string; reason: string } | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCheck = async () => {
    if (!symptoms.trim()) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const analysis = await analyzeSymptoms(symptoms);
      if (analysis) {
        setResult(analysis);
      } else {
        setError('無法分析您的症狀，請試著描述得更詳細一點。');
      }
    } catch (e) {
      setError('系統發生錯誤，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    if (result) {
      // Pass the department ID to the booking page via state
      navigate('/book', { state: { preselectedDeptId: result.departmentId } });
    }
  };

  const suggestedDept = result ? DEPARTMENTS.find(d => d.id === result.departmentId) : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="w-6 h-6" />
            AI 智慧導診
          </h2>
          <p className="text-teal-100 mt-1">
            不確定該掛哪一科？告訴我您的症狀，我來幫您判斷。
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              請描述您的症狀
            </label>
            <textarea
              className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none text-slate-800"
              rows={4}
              placeholder="例如：我最近常覺得頭暈，有時候會想吐，而且肚子痛..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {result && suggestedDept && (
            <div className="bg-accent p-6 rounded-xl border border-teal-100 animate-fade-in">
              <div className="mb-4">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">推薦科別</span>
                <h3 className="text-xl font-bold text-slate-800 mt-1 flex items-center gap-2">
                  <span className="text-2xl">{suggestedDept.icon}</span>
                  {suggestedDept.name}
                </h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed bg-white/50 p-3 rounded-lg border border-teal-50">
                <span className="font-semibold text-slate-700">分析原因：</span> {result.reason}
              </p>
              
              <button
                onClick={handleBooking}
                className="mt-4 w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-secondary transition-colors flex items-center justify-center gap-2"
              >
                前往掛號
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {!result && (
            <button
              onClick={handleCheck}
              disabled={!symptoms.trim() || loading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                !symptoms.trim() || loading
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-800 text-white hover:bg-slate-700 shadow-md hover:shadow-lg'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AI 分析中...
                </>
              ) : (
                '開始分析'
              )}
            </button>
          )}
        </div>
      </div>
      
      <p className="text-center text-xs text-slate-400 mt-4">
        注意：AI 建議僅供參考，若有緊急狀況請立即撥打 119 或前往急診。
      </p>
    </div>
  );
};
