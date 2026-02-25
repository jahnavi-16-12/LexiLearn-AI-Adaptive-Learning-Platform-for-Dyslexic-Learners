-- ==========================================
-- 🦁 LexiLearn AI - Complete Database Schema
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Update PROFILES table (Add missing columns)
-- We use 'IF NOT EXISTS' to avoid errors if you already have them.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text default 'student'; -- 'student' or 'parent'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_variant text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender text; -- 'boy', 'girl', 'other'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS grade text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_daily_completed date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linked_child_id uuid REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_stars int default 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS words_read int default 0;

-- 2. Create LEVEL_COMPLETIONS table
CREATE TABLE IF NOT EXISTS level_completions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES profiles(id) NOT NULL,
    level int NOT NULL,
    stars int DEFAULT 0,
    accuracy float DEFAULT 0.0,
    wpm float DEFAULT 0.0,
    duration_seconds int DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- 3. Create SCREENING_RESULTS table
CREATE TABLE IF NOT EXISTS screening_results (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES profiles(id) NOT NULL,
    calculated_score int,
    risk_level text, -- 'Low', 'Medium', 'High'
    risk_details jsonb,
    phoneme_score int,
    rhyme_score int,
    letter_score int,
    reading_wpm float,
    reading_wer float,
    audio_url text,
    created_at timestamptz DEFAULT now()
);

-- 4. Create CHILD_ACTIVITY_SUMMARY table (For Charts)
CREATE TABLE IF NOT EXISTS child_activity_summary (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id uuid REFERENCES profiles(id) NOT NULL,
    activity_date date DEFAULT CURRENT_DATE,
    minutes_spent int DEFAULT 0,
    games_played int DEFAULT 0,
    words_read int DEFAULT 0,
    stars_earned int DEFAULT 0,
    UNIQUE(child_id, activity_date)
);

-- 5. Create AI_CHAT_LOGS table
CREATE TABLE IF NOT EXISTS ai_chat_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES profiles(id) NOT NULL,
    message text NOT NULL,
    started_at timestamptz DEFAULT now(),
    ai_response text, 
    context jsonb 
);

-- 6. Create GAME_SCORES table
CREATE TABLE IF NOT EXISTS game_scores (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES profiles(id) NOT NULL,
    game_id text NOT NULL,
    score int DEFAULT 0,
    stars_earned int DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- 7. Advanced Row Level Security (RLS)

-- Profiles: Students see themselves, Parents see linked children
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles Access" ON profiles;
CREATE POLICY "Profiles Access" ON profiles FOR SELECT 
USING (
    auth.uid() = id OR 
    linked_child_id = auth.uid()
);

-- Policy to allow a parent to link an unlinked child if they have the ID
DROP POLICY IF EXISTS "Parent Link Child" ON profiles;
CREATE POLICY "Parent Link Child" ON profiles FOR UPDATE
TO authenticated
USING (role = 'student' AND linked_child_id IS NULL)
WITH CHECK (linked_child_id = auth.uid());

-- Level Completions Access
ALTER TABLE level_completions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Student LC Access" ON level_completions;
DROP POLICY IF EXISTS "Parent LC Read Access" ON level_completions;
CREATE POLICY "Student LC Access" ON level_completions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Parent LC Read Access" ON level_completions FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = level_completions.user_id AND linked_child_id = auth.uid()));

-- Screening Results Access
ALTER TABLE screening_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Student Screening Access" ON screening_results;
DROP POLICY IF EXISTS "Parent Screening Read Access" ON screening_results;
CREATE POLICY "Student Screening Access" ON screening_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Parent Screening Read Access" ON screening_results FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = screening_results.user_id AND linked_child_id = auth.uid()));

-- Game Scores Access
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Student Game Access" ON game_scores;
DROP POLICY IF EXISTS "Parent Game Read Access" ON game_scores;
CREATE POLICY "Student Game Access" ON game_scores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Parent Game Read Access" ON game_scores FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = game_scores.user_id AND linked_child_id = auth.uid()));

-- Activity Summary Access (Parent only)
ALTER TABLE child_activity_summary ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Summary Access" ON child_activity_summary;
CREATE POLICY "Summary Access" ON child_activity_summary FOR ALL 
USING (child_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = child_activity_summary.child_id AND linked_child_id = auth.uid()));

-- AI Chat Logs Access
ALTER TABLE ai_chat_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Student Chat Access" ON ai_chat_logs;
DROP POLICY IF EXISTS "Parent Chat Read Access" ON ai_chat_logs;
CREATE POLICY "Student Chat Access" ON ai_chat_logs FOR ALL USING (auth.uid() = user_id OR true);
CREATE POLICY "Parent Chat Read Access" ON ai_chat_logs FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = ai_chat_logs.user_id AND linked_child_id = auth.uid()));

-- Done! 🦁
