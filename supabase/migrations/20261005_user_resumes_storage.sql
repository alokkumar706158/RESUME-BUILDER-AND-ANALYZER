-- Create user_resumes table for storing user resume data
CREATE TABLE IF NOT EXISTS public.user_resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    filename TEXT DEFAULT 'builder_resume.pdf',
    file_path TEXT,
    file_size BIGINT DEFAULT 0,
    file_url TEXT,
    extracted_data JSONB DEFAULT '{}'::jsonb,
    improved_resume JSONB DEFAULT '{}'::jsonb,
    selected_template TEXT DEFAULT 'classic',
    job_role TEXT DEFAULT 'Software Engineer',
    ats_score INTEGER DEFAULT 85,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT user_resumes_user_id_key UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.user_resumes ENABLE ROW LEVEL SECURITY;

-- RLS Policies using auth.uid()
DROP POLICY IF EXISTS "Users can view own resumes" ON public.user_resumes;
CREATE POLICY "Users can view own resumes"
    ON public.user_resumes FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own resumes" ON public.user_resumes;
CREATE POLICY "Users can insert own resumes"
    ON public.user_resumes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own resumes" ON public.user_resumes;
CREATE POLICY "Users can update own resumes"
    ON public.user_resumes FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own resumes" ON public.user_resumes;
CREATE POLICY "Users can delete own resumes"
    ON public.user_resumes FOR DELETE
    USING (auth.uid() = user_id);
