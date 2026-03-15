-- Saved documents table for CV and cover letter persistence
-- Users can save generated documents and reload them later without AI regeneration

CREATE TABLE saved_documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('cv', 'letter')),
  title text NOT NULL,
  document_data jsonb NOT NULL,
  template text,
  accent_color text DEFAULT '#2c3e50',
  photo text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE saved_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents" ON saved_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON saved_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON saved_documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON saved_documents FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_saved_documents_user ON saved_documents(user_id, type, updated_at DESC);
