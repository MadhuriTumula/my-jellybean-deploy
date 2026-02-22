# MyJellyBean 🫧

MyJellyBean is a full-stack safety analysis tool designed to help people detect scams, impersonation, harassment, and other digital risks in messages.

## 🚀 How it helps human safety

MyJellyBean acts as a "second set of eyes" for suspicious digital interactions. By providing:
- **Objective Risk Scoring:** Removing the emotional urgency scammers rely on.
- **Red Flag Detection:** Highlighting specific signals like "asked for OTP" or "threatened me".
- **Actionable Checklists:** Giving users clear, non-escalatory steps to take immediately.
- **Safer Reply Drafts:** Preventing users from accidentally sharing more data or escalating a conflict.

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Motion, Lucide Icons.
- **Backend:** Express, Node.js.
- **AI:** Google Gemini 3 Flash (via `@google/genai`).
- **Deployment:** Optimized for Vercel or Firebase Hosting.

## 📦 Setup & Running Locally

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file (or use the Secrets panel in AI Studio) with:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## 🚢 Deployment

### Vercel
1. Connect your repository to Vercel.
2. Set the `GEMINI_API_KEY` environment variable.
3. Vercel will automatically detect the build settings.

### Firebase Hosting
1. Initialize Firebase in your project: `firebase init`.
2. Choose "Hosting" and "Functions" if you want a serverless backend, or use Firebase App Hosting.
3. Build the project: `npm run build`.
4. Deploy: `firebase deploy`.

## 🧪 60-Second Demo Checklist

1. **Open the App:** Navigate to the home page.
2. **Enable Demo Mode:** Scroll down and toggle "Demo Mode" to ON.
3. **Select a Sample:** Click on "Impersonation (Bank)" or "Suspicious Crypto Scam".
4. **Analyze:** Click the "Analyze Message" button.
5. **Review Results:** Show the Risk Meter, the "Why it matters" section, and the "Do This Now" checklist.
6. **Show Report:** Click "Create Report" to see the structured summary ready for platform reporting.
7. **Safer Reply:** Show the "Safer Reply Draft" and click copy.

---
*Disclaimer: This tool provides informational guidance, not legal advice.*
