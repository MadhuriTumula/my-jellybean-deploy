export interface AnalysisResult {
  category: "scam_fraud" | "impersonation" | "harassment_abuse" | "coercion_manipulation" | "privacy_risk" | "meetup_escalation_risk" | "self_harm_or_violence_risk" | "uncertain" | "safe";
  risk_score: number;
  confidence: number;
  top_signals: string[];
  why_it_matters: string;
  do_this_now: string[];
  safer_reply: string;
  report_summary: {
    what_happened: string;
    why_risky: string[];
    next_steps: string[];
    evidence_checklist: string[];
  };
  limitations: string;
}

export interface SampleMessage {
  id: number;
  label: string;
  message: string;
  platform: string;
  relationship: string;
  context: {
    asked_for_money?: boolean;
    asked_to_move_off_platform?: boolean;
    asked_for_otp?: boolean;
    threatened_me?: boolean;
    asking_for_meetup?: boolean;
    sexual_content?: boolean;
  };
}
