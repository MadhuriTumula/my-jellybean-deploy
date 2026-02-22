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
import CloudHero from './components/CloudHero';

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
  <header className="border-b-2 border-[#dde2ec] bg-[#f9fafd] sticky top-0 z-50">
    <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
      <div 
        className="flex items-center gap-3 cursor-pointer group" 
        onClick={() => onNavigate('home')}
      >
        <div className="bg-[#dd7826] p-2 rounded-xl border-2 border-[#1f1b2e] group-hover:rotate-12 transition-transform">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <span className="font-display font-bold text-2xl tracking-tight text-[#1f1b2e]">MyJellyBean</span>
      </div>
      <nav className="flex gap-4">
        <button 
          onClick={() => onNavigate('home')}
          className={`candy-button px-6 py-2 text-sm font-bold border-2 transition-all ${currentPage === 'home' ? 'bg-[#dd7826] border-[#1f1b2e] text-white' : 'bg-white border-[#dde2ec] text-[#7e73af] hover:border-[#7e73af]'}`}
        >
          Analyze
        </button>
        <button 
          onClick={() => onNavigate('education')}
          className={`candy-button px-6 py-2 text-sm font-bold border-2 transition-all ${currentPage === 'education' ? 'bg-[#dd7826] border-[#1f1b2e] text-white' : 'bg-white border-[#dde2ec] text-[#7e73af] hover:border-[#7e73af]'}`}
        >
          Learn
        </button>
      </nav>
    </div>
  </header>
);

const Footer = () => (
  <footer className="border-t-2 border-[#dde2ec] bg-[#f9fafd] py-12 mt-auto">
    <div className="max-w-5xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-[#dd7826] p-1.5 rounded-lg border border-[#1f1b2e]">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-[#1f1b2e]">MyJellyBean</span>
          </div>
          <p className="text-sm text-[#7e73af] max-w-sm">
            Bite-sized clarity for high-pressure messages. 
            Helping you navigate the digital sky with confidence.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="font-bold text-sm text-[#1f1b2e] uppercase tracking-wider">Legal</h4>
          <p className="text-xs text-[#7e73af]">
            Disclaimer: This tool provides informational guidance, not legal advice. 
            MyJellyBean does not store your message content by default.
          </p>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-[#dde2ec] text-center">
        <p className="text-xs text-[#7e73af]">© 2026 MyJellyBean. Pure Imagination.</p>
      </div>
    </div>
  </footer>
);

const RiskMeter = ({ score }: { score: number }) => {
  const getColor = (s: number) => {
    if (s < 30) return 'bg-[#2ecc71]';
    if (s < 70) return 'bg-[#dd7826]';
    return 'bg-[#ff5c8a]';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-2">
        <span className="text-xs font-bold text-[#7e73af] uppercase tracking-wider">Risk Level</span>
        <span className={`text-4xl font-display font-bold ${score < 30 ? 'text-[#2ecc71]' : score < 70 ? 'text-[#dd7826]' : 'text-[#ff5c8a]'}`}>
          {score}%
        </span>
      </div>
      <div className="h-4 w-full bg-[#dde2ec] rounded-full overflow-hidden border-2 border-[#1f1b2e]">
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
    <div className="pb-24">
      <CloudHero />
      
      <div className="max-w-4xl mx-auto -mt-12 px-4 relative z-20">
        <div className="card p-6 md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl font-display font-bold text-[#1f1b2e]">Analyze Message</h2>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-bold text-[#7e73af] uppercase tracking-widest self-center mr-2">Demo jellybeans:</span>
              {sampleMessages.slice(0, 3).map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => fillSample(sample as any)}
                  className="candy-button px-3 py-1.5 bg-[#f9fafd] border-2 border-[#dde2ec] text-[#7e73af] text-xs font-bold hover:border-[#dd7826] hover:text-[#dd7826] transition-all"
                >
                  {sample.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMessage('');
                  setPlatform('');
                  setRelationship('');
                  setContext({
                    asked_for_money: false,
                    asked_to_move_off_platform: false,
                    asked_for_otp: false,
                    threatened_me: false,
                    asking_for_meetup: false,
                    sexual_content: false,
                  });
                }}
                className="candy-button px-3 py-1.5 bg-[#ff5c8a] border-2 border-[#1f1b2e] text-white text-xs font-bold hover:opacity-90 transition-all"
              >
                Clear
              </button>
            </div>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-8">
            <div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Paste the message here... (Don't paste passwords or private keys)"
                className="w-full h-40 p-6 bg-[#f9fafd] border-2 border-[#dde2ec] rounded-3xl focus:ring-4 focus:ring-[#a4c7fe] focus:border-[#dd7826] transition-all resize-none text-[#1f1b2e] font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#1f1b2e] mb-2 px-1">Platform</label>
                <select 
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full p-3.5 bg-[#f9fafd] border-2 border-[#dde2ec] rounded-2xl text-[#1f1b2e] font-medium focus:border-[#dd7826] outline-none"
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
                <label className="block text-sm font-bold text-[#1f1b2e] mb-2 px-1">Relationship</label>
                <select 
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full p-3.5 bg-[#f9fafd] border-2 border-[#dde2ec] rounded-2xl text-[#1f1b2e] font-medium focus:border-[#dd7826] outline-none"
                >
                  <option value="">Select Relationship</option>
                  <option value="unknown">Unknown / Stranger</option>
                  <option value="friend">Friend</option>
                  <option value="coworker">Coworker</option>
                  <option value="romantic interest">Romantic Interest</option>
                  <option value="buyer/seller">Buyer / Seller</option>
                  <option value="authority figure">Authority Figure</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1f1b2e] mb-4 px-1">Context Signals</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: 'asked_for_money', label: 'Asked for money' },
                  { id: 'asked_to_move_off_platform', label: 'Asked to move off-platform' },
                  { id: 'asked_for_otp', label: 'Asked for OTP/code' },
                  { id: 'threatened_me', label: 'Threatened me' },
                  { id: 'asking_for_meetup', label: 'Asking for meetup' },
                  { id: 'sexual_content', label: 'Sexual content' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={context[item.id as keyof typeof context]}
                    onClick={() => setContext({ ...context, [item.id]: !context[item.id as keyof typeof context] })}
                    className={`candy-button px-4 py-2 text-sm font-bold border-2 transition-all ${
                      context[item.id as keyof typeof context] 
                        ? 'bg-[#dd7826] border-[#1f1b2e] text-white' 
                        : 'bg-white border-[#7e73af] text-[#1f1b2e] hover:bg-[#f9fafd]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t-2 border-[#dde2ec]">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-6 h-6 rounded-lg border-2 border-[#1f1b2e] flex items-center justify-center transition-all ${saveToHistory ? 'bg-[#2ecc71]' : 'bg-white'}`}>
                  {saveToHistory && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
                <input
                  type="checkbox"
                  checked={saveToHistory}
                  onChange={(e) => setSaveToHistory(e.target.checked)}
                  className="hidden"
                />
                <span className="text-sm font-bold text-[#7e73af] group-hover:text-[#1f1b2e]">Save to local history</span>
              </label>
              <button
                type="submit"
                disabled={isAnalyzing}
                className="candy-button w-full sm:w-auto bg-[#dd7826] hover:bg-[#c66b22] text-white font-bold py-4 px-10 border-2 border-[#1f1b2e] disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    Inspecting...
                  </>
                ) : (
                  <>
                    Analyze Now
                    <ChevronRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!result) return null;

    const isHighRisk = result.risk_score >= 70;
    const isMedRisk = result.risk_score >= 30 && result.risk_score < 70;

    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <button 
            onClick={() => setCurrentPage('home')}
            className="candy-button px-5 py-2.5 bg-white border-2 border-[#dde2ec] text-[#7e73af] text-sm font-bold hover:border-[#1f1b2e] hover:text-[#1f1b2e] flex items-center gap-2"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Analyze Another
          </button>
          <button 
            onClick={() => setCurrentPage('report')}
            className="candy-button px-6 py-2.5 bg-[#1f1b2e] text-white text-sm font-bold hover:bg-black flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Create Report
          </button>
        </div>

        {isHighRisk && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-10 bg-[#ff5c8a]/10 border-2 border-[#ff5c8a] rounded-3xl p-6 flex gap-4 items-start"
          >
            <AlertCircle className="w-8 h-8 text-[#ff5c8a] shrink-0" />
            <div>
              <h3 className="text-[#ff5c8a] font-display font-bold text-xl">Immediate Danger?</h3>
              <p className="text-[#1f1b2e] font-medium">
                If you feel you are in immediate physical danger or being stalked, please contact your local emergency services immediately.
              </p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Factory Inspection Report */}
          <div className="lg:col-span-7 space-y-8">
            <div className="card p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl border-2 border-[#1f1b2e] ${isHighRisk ? 'bg-[#ff5c8a]' : isMedRisk ? 'bg-[#dd7826]' : 'bg-[#2ecc71]'}`}>
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-display font-bold text-[#1f1b2e] capitalize">
                      {result.category.replace(/_/g, ' ')}
                    </h2>
                    <p className="text-sm font-bold text-[#7e73af] uppercase tracking-widest">Inspection Result</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#7e73af] uppercase tracking-widest">Confidence</p>
                  <p className="text-xl font-bold text-[#1f1b2e]">{(result.confidence * 100).toFixed(0)}%</p>
                </div>
              </div>

              <RiskMeter score={result.risk_score} />

              <div className="mt-10 pt-8 border-t-2 border-[#dde2ec]">
                <h3 className="text-xs font-bold text-[#7e73af] uppercase tracking-widest mb-4">Why it matters</h3>
                <p className="text-[#1f1b2e] text-lg font-medium leading-relaxed">
                  {result.why_it_matters}
                </p>
              </div>

              <div className="mt-10">
                <h3 className="text-xs font-bold text-[#7e73af] uppercase tracking-widest mb-4">Top Signals</h3>
                <div className="flex flex-wrap gap-3">
                  {result.top_signals.map((signal, i) => (
                    <div key={i} className="px-4 py-2 bg-[#f9fafd] border-2 border-[#dde2ec] rounded-xl text-sm font-bold text-[#1f1b2e]">
                      {signal}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Safer Reply Card */}
            <div className="bg-[#1f1b2e] text-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#dd7826]/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-[#dd7826] p-2 rounded-lg">
                    <MessageSquareWarning className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-display font-bold text-2xl">Safer Reply Draft</h3>
                </div>
                <button 
                  onClick={() => copyToClipboard(result.safer_reply)}
                  className="candy-button p-3 bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <Copy className="w-6 h-6" />
                </button>
              </div>
              <div className="bg-white/5 border-2 border-white/10 rounded-2xl p-6 italic text-xl text-zinc-200 leading-relaxed relative z-10">
                "{result.safer_reply}"
              </div>
              <p className="mt-6 text-sm text-zinc-400 font-medium relative z-10">
                Designed to be non-escalatory and protective of your privacy.
              </p>
            </div>
          </div>

          {/* Right Column: Actions & Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="card p-8 border-[#2ecc71]/30">
              <h3 className="font-display font-bold text-2xl text-[#1f1b2e] mb-8 flex items-center gap-3">
                <CheckCircle2 className="w-7 h-7 text-[#2ecc71]" />
                Do This Now
              </h3>
              <div className="space-y-6">
                {result.do_this_now.map((step, i) => (
                  <div key={i} className="flex gap-4 items-start group">
                    <div className="w-8 h-8 rounded-xl bg-[#2ecc71] text-white flex items-center justify-center text-sm font-bold shrink-0 border-2 border-[#1f1b2e] group-hover:scale-110 transition-transform">
                      {i + 1}
                    </div>
                    <p className="text-[#1f1b2e] font-bold leading-snug pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6 bg-[#f9fafd] border-dashed">
              <h3 className="font-bold text-[#1f1b2e] mb-3 flex items-center gap-2 text-sm uppercase tracking-widest">
                <Info className="w-4 h-4 text-[#7e73af]" />
                AI Limitations
              </h3>
              <p className="text-sm text-[#7e73af] font-medium leading-relaxed">
                {result.limitations}
              </p>
            </div>

            <div className="card p-8 bg-[#a4c7fe]/10 border-[#a4c7fe]">
              <h3 className="font-display font-bold text-xl text-[#1f1b2e] mb-4">Report Summary</h3>
              <p className="text-sm text-[#7e73af] font-medium mb-6">
                Ready to report this to the platform? We've prepared a structured summary for you.
              </p>
              <button 
                onClick={() => setCurrentPage('report')}
                className="candy-button w-full py-4 bg-white border-2 border-[#1f1b2e] text-[#1f1b2e] font-bold hover:bg-[#f9fafd] transition-all flex items-center justify-center gap-2"
              >
                View Report
                <ChevronRight className="w-5 h-5" />
              </button>
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
RISK SCORE: ${result.risk_score}%

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
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="mb-8">
          <button 
            onClick={() => setCurrentPage('results')}
            className="candy-button px-5 py-2.5 bg-white border-2 border-[#dde2ec] text-[#7e73af] text-sm font-bold hover:border-[#1f1b2e] hover:text-[#1f1b2e] flex items-center gap-2"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Results
          </button>
        </div>

        <div className="card overflow-hidden border-[#1f1b2e]">
          <div className="bg-[#1f1b2e] p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-display font-bold">Report Summary</h2>
              <p className="text-sm text-zinc-400 font-medium">Shareable summary for platform reporting</p>
            </div>
            <button 
              onClick={() => copyToClipboard(reportText)}
              className="candy-button bg-[#dd7826] hover:bg-[#c66b22] text-white px-8 py-3 border-2 border-white/20 font-bold transition-all flex items-center gap-2"
            >
              <Copy className="w-5 h-5" />
              Copy Report Text
            </button>
          </div>
          
          <div className="p-10 space-y-10">
            <section>
              <h3 className="text-xs font-bold text-[#7e73af] uppercase tracking-widest mb-4">What Happened</h3>
              <div className="bg-[#f9fafd] p-6 rounded-3xl border-2 border-[#dde2ec] italic text-xl text-[#1f1b2e] font-medium">
                {summary.what_happened}
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <section>
                <h3 className="text-xs font-bold text-[#7e73af] uppercase tracking-widest mb-4">Risk Signals</h3>
                <ul className="space-y-3">
                  {summary.why_risky.map((item, i) => (
                    <li key={i} className="text-[#1f1b2e] font-bold flex gap-3">
                      <span className="text-[#ff5c8a]">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h3 className="text-xs font-bold text-[#7e73af] uppercase tracking-widest mb-4">Action Plan</h3>
                <ul className="space-y-3">
                  {summary.next_steps.map((item, i) => (
                    <li key={i} className="text-[#1f1b2e] font-bold flex gap-3">
                      <span className="text-[#2ecc71]">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section className="pt-10 border-t-2 border-[#dde2ec]">
              <h3 className="text-xs font-bold text-[#7e73af] uppercase tracking-widest mb-6">Evidence Checklist</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {summary.evidence_checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-[#f9fafd] border-2 border-[#dde2ec] rounded-2xl">
                    <div className="w-6 h-6 rounded-lg border-2 border-[#1f1b2e] bg-white" />
                    <span className="text-sm font-bold text-[#1f1b2e]">{item}</span>
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
    <div className="pb-24">
      <div className="bg-sky-gradient pt-20 pb-16 px-4 text-center">
        <h1 className="text-5xl font-display font-bold title-stroke mb-4">Safety Playbook</h1>
        <p className="text-xl text-[#1f1b2e] font-medium opacity-80">Quick guides to common patterns and verification steps.</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          <div className="space-y-8">
            <h2 className="text-2xl font-display font-bold text-[#1f1b2e] flex items-center gap-3">
              <div className="bg-[#dd7826] p-2 rounded-xl border-2 border-[#1f1b2e]">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              Common Scam Patterns
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'The Overpayment', desc: 'Buyer sends "too much" money and asks for the difference back.' },
                { title: 'The Urgent Authority', desc: 'Someone claiming to be police, IRS, or bank demanding immediate payment.' },
                { title: 'The Romance Trap', desc: 'A new online interest who suddenly needs money for an emergency.' },
                { title: 'The Verification Code', desc: 'Asking for a code sent to your phone to "help" you or "verify" you.' },
                { title: 'The Job Fee', desc: 'A high-paying job that requires you to pay for equipment or training upfront.' },
                { title: 'The Tech Support', desc: 'A popup or message saying your PC is infected and giving a number to call.' },
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -5 }}
                  className="card p-5 border-b-4 border-b-[#dd7826]"
                >
                  <h4 className="font-bold text-[#1f1b2e] text-base mb-2">{item.title}</h4>
                  <p className="text-xs text-[#7e73af] font-medium leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-2xl font-display font-bold text-[#1f1b2e] flex items-center gap-3">
              <div className="bg-[#2ecc71] p-2 rounded-xl border-2 border-[#1f1b2e]">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              Verification Playbook
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Call the Official Number', desc: 'Never call a number provided in a suspicious message. Use the one on the back of your card.' },
                { title: 'Check Profile Age', desc: 'Scammers often use brand new accounts. Check when the profile was created.' },
                { title: 'Never Share OTPs', desc: 'One-Time Passwords are for YOU only. No legitimate company will ever ask for them.' },
                { title: 'Move Slowly', desc: 'Scammers rely on urgency. If they are rushing you, it is a major red flag.' },
                { title: 'Reverse Image Search', desc: 'Use Google Lens to see if their profile picture is a stock photo or stolen.' },
                { title: 'Ask for a Specific Detail', desc: 'If a "friend" asks for money, ask them something only your real friend would know.' },
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -5 }}
                  className="card p-5 border-b-4 border-b-[#2ecc71]"
                >
                  <h4 className="font-bold text-[#1f1b2e] text-base mb-2">{item.title}</h4>
                  <p className="text-xs text-[#7e73af] font-medium leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#1f1b2e] rounded-[40px] p-12 text-white text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-sky-gradient opacity-5"></div>
          <h2 className="text-4xl font-display font-bold mb-6 relative z-10">Need more help?</h2>
          <p className="text-zinc-400 mb-10 max-w-xl mx-auto text-lg font-medium relative z-10">
            If you've been a victim of a scam, report it to your local authorities and the platform where it occurred.
          </p>
          <div className="flex flex-wrap justify-center gap-6 relative z-10">
            <a href="https://reportfraud.ftc.gov/" target="_blank" className="candy-button bg-[#dd7826] text-white px-8 py-4 font-bold text-base flex items-center gap-2 hover:bg-[#c66b22] transition-colors border-2 border-white/20">
              FTC Fraud Report <ExternalLink className="w-5 h-5" />
            </a>
            <a href="https://www.ic3.gov/" target="_blank" className="candy-button bg-white/10 text-white px-8 py-4 font-bold text-base flex items-center gap-2 hover:bg-white/20 transition-colors border-2 border-white/10">
              FBI IC3 <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f9fafd] flex flex-col font-sans text-[#1f1b2e]">
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
