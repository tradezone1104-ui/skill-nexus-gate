import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!anonKey) {
  document.getElementById("root")!.innerHTML = `
    <div style="font-family:system-ui,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0f172a;color:#f1f5f9;text-align:center;padding:2rem">
      <div>
        <div style="font-size:3rem;margin-bottom:1rem">⚙️</div>
        <h1 style="font-size:1.5rem;font-weight:700;margin-bottom:0.75rem;color:#22c55e">Almost there!</h1>
        <p style="color:#94a3b8;margin-bottom:1.5rem;max-width:400px">
          Add your <strong style="color:#f1f5f9">Supabase Anon Key</strong> to the <code style="background:#1e293b;padding:2px 6px;border-radius:4px;color:#22c55e">.env</code> file to start the app.
        </p>
        <pre style="background:#1e293b;padding:1rem 1.5rem;border-radius:8px;text-align:left;font-size:0.85rem;color:#7dd3fc;border:1px solid #1e40af">VITE_SUPABASE_URL="https://ovotwcpcisqlleauzbza.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key-here"</pre>
        <p style="color:#64748b;font-size:0.85rem;margin-top:1rem">Then save the file — Vite will hot-reload automatically.</p>
      </div>
    </div>
  `;
} else {
  createRoot(document.getElementById("root")!).render(<App />);
}

