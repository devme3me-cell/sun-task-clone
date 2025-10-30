-- Create missions table
CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('聊天任務', '跟牌任務', '馬逼任務', '其他任務')),
  "desc" TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
  mission_title TEXT NOT NULL,
  mission_type TEXT NOT NULL,
  photos JSONB DEFAULT '[]'::jsonb,
  photos_count INTEGER DEFAULT 0,
  week INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_missions_active ON missions(active);
CREATE INDEX IF NOT EXISTS idx_missions_dates ON missions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_submissions_username ON submissions(username);
CREATE INDEX IF NOT EXISTS idx_submissions_mission ON submissions(mission_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since we don't have auth yet)
CREATE POLICY "Allow public read access on missions"
  ON missions FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on missions"
  ON missions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on missions"
  ON missions FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete on missions"
  ON missions FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access on submissions"
  ON submissions FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on submissions"
  ON submissions FOR INSERT
  WITH CHECK (true);

-- Note: For production, you should implement proper authentication
-- and restrict these policies based on user roles
