import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Copy, 
  RefreshCw, 
  BookOpen, 
  ChevronRight, 
  ExternalLink,
  AlertCircle,
  History,
  Trash2,
  Share2,
  MessageSquareWarning
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult, SampleMessage } from './types';
import sampleMessages from './sample_messages.json';

// --- Gemini Analysis ---

const analyzeMessage = async (message: string, platform: string, relationship: string, context: any): Promise<AnalysisResult> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please ensure it is set in the Secrets panel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this message for safety risks.
    
    Message: "${message}"
    Platform: ${platform || 'Unknown'}
    Relationship: ${relationship || 'Unknown'}
    Additional Context: ${JSON.stringify(context || {})}
    `,
    config: {
      systemInstruction: `You are a world-class human-safety analyst. Your goal is to protect users from scams, impersonation, harassment, and coercion.
      
      Guidelines:
      - Prioritize user protection and be conservative in risk scoring.
      - Never encourage retaliation, doxxing, or threats.
      - If content suggests imminent danger (violence, stalking, self-harm), explicitly state to contact emergency services.
      - If uncertain, choose "uncertain" and provide verification steps.
      - Provide a strict JSON response.
      
      Categories: scam_fraud, impersonation, harassment_abuse, coercion_manipulation, privacy_risk, meetup_escalation_risk, self_harm_or_violence_risk, uncertain, safe.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          risk_score: { type: Type.INTEGER },
          confidence: { type: Type.NUMBER },
          top_signals: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          why_it_matters: { type: Type.STRING },
          do_this_now: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          safer_reply: { type: Type.STRING },
          report_summary: {
            type: Type.OBJECT,
            properties: {
              what_happened: { type: Type.STRING },
              why_risky: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              next_steps: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              evidence_checklist: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["what_happened", "why_risky", "next_steps", "evidence_checklist"]
          },
          limitations: { type: Type.STRING }
        },
        required: ["category", "risk_score", "confidence", "top_signals", "why_it_matters", "do_this_now", "safer_reply", "report_summary", "limitations"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

// --- Components ---

const Header = ({ onNavigate, currentPage }: { onNavigate: (page: string) => void, currentPage: string }) => (
  <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
    <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => onNavigate('home')}
      >
        <div className="bg-emerald-600 p-1.5 rounded-lg">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div className="leading-tight">
          <span className="font-bold text-xl tracking-tight text-zinc-900">MyJellyBean</span>
          <div className="text-xs text-zinc-500">Bite-sized clarity for high-pressure messages.</div>
        </div>
      </div>
      <nav className="flex gap-6">
        <button 
          onClick={() => onNavigate('home')}
          className={`text-sm font-medium transition-colors ${currentPage === 'home' ? 'text-emerald-600' : 'text-zinc-500 hover:text-zinc-900'}`}
        >
          Analyze
        </button>
        <button 
          onClick={() => onNavigate('education')}
          className={`text-sm font-medium transition-colors ${currentPage === 'education' ? 'text-emerald-600' : 'text-zinc-500 hover:text-zinc-900'}`}
        >
          Learn
        </button>
      </nav>
    </div>
  </header>
);

const Footer = () => (
  <footer className="border-t border-zinc-200 bg-zinc-50 py-12 mt-auto">
    <div className="max-w-5xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="font-bold text-lg">MyJellyBean</div>
              <div className="text-xs text-zinc-500">Bite-sized clarity for high-pressure messages.</div>
            </div>
          </div>
          <p className="text-sm text-zinc-500 max-w-sm">
            Empowering users to make safer decisions in a digital world. 
            We help you spot the red flags before they become real problems.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="font-semibold text-sm text-zinc-900 uppercase tracking-wider">Legal</h4>
          <p className="text-xs text-zinc-400">
            Disclaimer: This tool provides informational guidance, not legal advice. 
            SafeKit Shield does not store your message content by default.
          </p>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-zinc-200 text-center">
        <p className="text-xs text-zinc-400">© 2026 MyJellyBean. Bite-sized clarity for high-pressure messages.</p>
      </div>
    </div>
  </footer>
);

const RiskMeter = ({ score }: { score: number }) => {
  const getColor = (s: number) => {
    if (s < 30) return 'bg-emerald-500';
    if (s < 70) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Risk Level</span>
        <span className={`text-3xl font-bold ${score < 30 ? 'text-emerald-600' : score < 70 ? 'text-amber-600' : 'text-rose-600'}`}>
          {score}/100
        </span>
      </div>
      <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          className={`h-full ${getColor(score)}`}
        />
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [saveToHistory, setSaveToHistory] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  
  // Form State
  const [message, setMessage] = useState('');
  const [platform, setPlatform] = useState('');
  const [relationship, setRelationship] = useState('');
  const [context, setContext] = useState({
    asked_for_money: false,
    asked_to_move_off_platform: false,
    asked_for_otp: false,
    threatened_me: false,
    asking_for_meetup: false,
    sexual_content: false,
  });

  useEffect(() => {
    const savedHistory = localStorage.getItem('safekit_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim()) return;

    setIsAnalyzing(true);
    try {
      const data = await analyzeMessage(message, platform, relationship, context);
      setResult(data);
      
      if (saveToHistory) {
        const newHistory = [data, ...history].slice(0, 10);
        setHistory(newHistory);
        localStorage.setItem('safekit_history', JSON.stringify(newHistory));
      }
      
      setCurrentPage('results');
    } catch (error) {
      console.error(error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fillSample = (sample: SampleMessage) => {
    setMessage(sample.message);
    setPlatform(sample.platform);
    setRelationship(sample.relationship);
    setContext({
      asked_for_money: sample.context.asked_for_money || false,
      asked_to_move_off_platform: sample.context.asked_to_move_off_platform || false,
      asked_for_otp: sample.context.asked_for_otp || false,
      threatened_me: sample.context.threatened_me || false,
      asking_for_meetup: sample.context.asking_for_meetup || false,
      sexual_content: sample.context.sexual_content || false,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const renderHome = () => (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-zinc-900 mb-3 tracking-tight">
          MyJellyBean
        </h1>
        <p className="text-lg text-zinc-500">
          Paste a message. Get a risk score, red flags, and safer next steps.
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 md:p-8">
        <form onSubmit={handleAnalyze} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">
              Suspicious Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste the message here... (Don't paste passwords or private keys)"
              className="w-full h-32 p-4 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Platform</label>
              <select 
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full p-2.5 border border-zinc-200 rounded-lg bg-zinc-50 text-sm"
              >
                <option value="">Select Platform</option>
                <option value="SMS">SMS / Text</option>
                <option value="Instagram">Instagram</option>
                <option value="Discord">Discord</option>
                <option value="Email">Email</option>
                <option value="Marketplace">Marketplace</option>
                <option value="Dating app">Dating App</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Relationship</label>
              <select 
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full p-2.5 border border-zinc-200 rounded-lg bg-zinc-50 text-sm"
              >
                <option value="">Select Relationship</option>
                <option value="unknown">Unknown / Stranger</option>
                <option value="friend">Friend</option>
                <option value="coworker">Coworker</option>
                <option value="romantic interest">Romantic Interest</option>
                <option value="buyer/seller">Buyer / Seller</option>
                <option value="authority figure">Authority Figure (Bank, Police, etc.)</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-3">Context Signals</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'asked_for_money', label: 'Asked for money' },
                { id: 'asked_to_move_off_platform', label: 'Asked to move off-platform' },
                { id: 'asked_for_otp', label: 'Asked for OTP/code' },
                { id: 'threatened_me', label: 'Threatened me' },
                { id: 'asking_for_meetup', label: 'Asking for meetup' },
                { id: 'sexual_content', label: 'Sexual content' },
              ].map((item) => (
                <label key={item.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={context[item.id as keyof typeof context]}
                    onChange={(e) => setContext({ ...context, [item.id]: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-zinc-300 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-zinc-600">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={saveToHistory}
                onChange={(e) => setSaveToHistory(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-zinc-300 focus:ring-emerald-500"
              />
              <span className="text-xs text-zinc-500">Save to local history</span>
            </label>
            <button
              type="submit"
              disabled={isAnalyzing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze Message
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Demo Mode */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Demo Mode</h3>
          <button 
            onClick={() => setDemoMode(!demoMode)}
            className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${demoMode ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}
          >
            {demoMode ? 'ON' : 'OFF'}
          </button>
        </div>
        {demoMode && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sampleMessages.slice(0, 4).map((sample) => (
              <button
                key={sample.id}
                onClick={() => fillSample(sample as any)}
                className="text-left p-3 border border-zinc-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
              >
                <span className="block text-xs font-bold text-zinc-400 mb-1 group-hover:text-emerald-600">{sample.label}</span>
                <span className="block text-sm text-zinc-600 line-clamp-1 italic">"{sample.message}"</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderResults = () => {
    if (!result) return null;

    const isHighRisk = result.risk_score >= 70;
    const isMedRisk = result.risk_score >= 30 && result.risk_score < 70;

    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="mb-8 flex items-center justify-between">
          <button 
            onClick={() => setCurrentPage('home')}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Analyze Another
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage('report')}
              className="text-sm font-bold bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Create Report
            </button>
          </div>
        </div>

        {isHighRisk && (
          <div className="mb-8 bg-rose-50 border border-rose-200 rounded-2xl p-4 flex gap-3 items-start">
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-rose-900 font-bold">Immediate Danger?</h3>
              <p className="text-rose-700 text-sm">
                If you feel you are in immediate physical danger or being stalked, please contact your local emergency services immediately.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Main Score Card */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-xl ${isHighRisk ? 'bg-rose-100 text-rose-600' : isMedRisk ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {isHighRisk ? <AlertTriangle className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 capitalize">
                    {result.category.replace(/_/g, ' ')}
                  </h2>
                  <p className="text-sm text-zinc-500">Analysis Confidence: {(result.confidence * 100).toFixed(0)}%</p>
                </div>
              </div>

              <RiskMeter score={result.risk_score} />

              <div className="mt-8 pt-8 border-t border-zinc-100">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Why it matters</h3>
                <p className="text-zinc-700 leading-relaxed">
                  {result.why_it_matters}
                </p>
              </div>

              <div className="mt-8">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Top Signals</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.top_signals.map((signal, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                      {signal}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Safer Reply Card */}
            <div className="bg-zinc-900 text-white rounded-2xl p-6 md:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <MessageSquareWarning className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-lg">Safer Reply Draft</h3>
                </div>
                <button 
                  onClick={() => copyToClipboard(result.safer_reply)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 italic text-zinc-300 leading-relaxed">
                "{result.safer_reply}"
              </div>
              <p className="mt-4 text-xs text-zinc-500">
                This reply is designed to be non-escalatory and avoids sharing personal information.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Checklist Card */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-zinc-900 mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Do This Now
              </h3>
              <div className="space-y-4">
                {result.do_this_now.map((step, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-zinc-600 leading-snug">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Limitations Card */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6">
              <h3 className="font-bold text-zinc-900 mb-2 flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-zinc-400" />
                AI Limitations
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {result.limitations}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReport = () => {
    if (!result) return null;
    const summary = result.report_summary;
    
    const reportText = `
  MYJELLYBEAN REPORT SUMMARY
  -----------------------------
  CATEGORY: ${result.category.toUpperCase()}
  RISK SCORE: ${result.risk_score}/100

  WHAT HAPPENED:
  ${summary.what_happened}

  WHY IT'S RISKY:
  ${summary.why_risky.map(s => `- ${s}`).join('\n')}

  MY NEXT STEPS:
  ${summary.next_steps.map(s => `- ${s}`).join('\n')}

  EVIDENCE CHECKLIST:
  ${summary.evidence_checklist.map(s => `- [ ] ${s}`).join('\n')}

  Generated by MyJellyBean
    `.trim();

    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="mb-8">
          <button 
            onClick={() => setCurrentPage('results')}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Results
          </button>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-zinc-900 p-6 text-white flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Report Summary</h2>
              <p className="text-xs text-zinc-400">Shareable summary for platform reporting</p>
            </div>
            <button 
              onClick={() => copyToClipboard(reportText)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Report Text
            </button>
          </div>
          
          <div className="p-8 space-y-8">
            <section>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">What Happened</h3>
              <p className="text-zinc-700 bg-zinc-50 p-4 rounded-xl border border-zinc-100 italic">
                {summary.what_happened}
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Risk Signals</h3>
                <ul className="space-y-2">
                  {summary.why_risky.map((item, i) => (
                    <li key={i} className="text-sm text-zinc-600 flex gap-2">
                      <span className="text-rose-500">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Action Plan</h3>
                <ul className="space-y-2">
                  {summary.next_steps.map((item, i) => (
                    <li key={i} className="text-sm text-zinc-600 flex gap-2">
                      <span className="text-emerald-500">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section className="pt-8 border-t border-zinc-100">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Evidence Checklist</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {summary.evidence_checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border border-zinc-200 rounded-xl">
                    <div className="w-5 h-5 rounded border-2 border-zinc-200" />
                    <span className="text-sm text-zinc-600">{item}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  };

  const renderEducation = () => (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-zinc-900 mb-4">Safety Playbook</h1>
        <p className="text-zinc-500">Quick guides to common patterns and verification steps.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Common Scam Patterns
          </h2>
          <div className="space-y-4">
            {[
              { title: 'The Overpayment', desc: 'Buyer sends "too much" money and asks for the difference back.' },
              { title: 'The Urgent Authority', desc: 'Someone claiming to be police, IRS, or bank demanding immediate payment.' },
              { title: 'The Romance Trap', desc: 'A new online interest who suddenly needs money for an emergency.' },
              { title: 'The Verification Code', desc: 'Asking for a code sent to your phone to "help" you or "verify" you.' },
              { title: 'The Job Fee', desc: 'A high-paying job that requires you to pay for equipment or training upfront.' },
              { title: 'The Tech Support', desc: 'A popup or message saying your PC is infected and giving a number to call.' },
            ].map((item, i) => (
              <div key={i} className="p-4 bg-white border border-zinc-200 rounded-xl shadow-sm">
                <h4 className="font-bold text-zinc-900 text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Verification Playbook
          </h2>
          <div className="space-y-4">
            {[
              { title: 'Call the Official Number', desc: 'Never call a number provided in a suspicious message. Use the one on the back of your card or official website.' },
              { title: 'Check Profile Age', desc: 'Scammers often use brand new accounts. Check when the profile was created.' },
              { title: 'Never Share OTPs', desc: 'One-Time Passwords are for YOU only. No legitimate company will ever ask for them.' },
              { title: 'Move Slowly', desc: 'Scammers rely on urgency. If they are rushing you, it is a major red flag.' },
              { title: 'Reverse Image Search', desc: 'Use Google Lens to see if their profile picture is a stock photo or stolen.' },
              { title: 'Ask for a Specific Detail', desc: 'If a "friend" asks for money, ask them something only your real friend would know.' },
            ].map((item, i) => (
              <div key={i} className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <h4 className="font-bold text-emerald-900 text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-emerald-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-3xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Need more help?</h2>
        <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
          If you've been a victim of a scam, report it to your local authorities and the platform where it occurred.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="https://reportfraud.ftc.gov/" target="_blank" className="bg-white text-zinc-900 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-zinc-100 transition-colors">
            FTC Fraud Report <ExternalLink className="w-4 h-4" />
          </a>
          <a href="https://www.ic3.gov/" target="_blank" className="bg-white/10 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-white/20 transition-colors">
            FBI IC3 <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900">
      <Header onNavigate={setCurrentPage} currentPage={currentPage} />
      
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentPage === 'home' && renderHome()}
            {currentPage === 'results' && renderResults()}
            {currentPage === 'report' && renderReport()}
            {currentPage === 'education' && renderEducation()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
