// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// ─── Substitua pelos valores do seu projeto Supabase ───────────────────────
// Vá em: https://app.supabase.com → Seu projeto → Settings → API
const SUPABASE_URL  = 'https://jegcfgwtaerolxveqgnf.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplZ2NmZ3d0YWVyb2x4dmVxZ25mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMzc2MzQsImV4cCI6MjA5MDkxMzYzNH0.amDN6w8T4zhMYcBONnIukfvVG1WD3AZPSvuUiBGwJAg';
// ──────────────────────────────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);