-- Create bingo_items table for storing bingo entries
CREATE TABLE IF NOT EXISTS public.bingo_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  category TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bingo_items ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read bingo items (public game)
CREATE POLICY "Anyone can view bingo items" 
  ON public.bingo_items 
  FOR SELECT 
  USING (true);

-- Insert some sample bingo items
INSERT INTO public.bingo_items (text, category) VALUES
  ('Jemand kommt zu spaet', 'meeting'),
  ('Technische Probleme', 'meeting'),
  ('Kannst du deinen Bildschirm teilen?', 'meeting'),
  ('Ich bin stumm geschaltet', 'meeting'),
  ('Hoert ihr mich?', 'meeting'),
  ('Kurze Pause', 'meeting'),
  ('Das besprechen wir offline', 'meeting'),
  ('Synergien nutzen', 'meeting'),
  ('Proaktiv handeln', 'meeting'),
  ('Am Ende des Tages', 'meeting'),
  ('Auf dem Schirm haben', 'meeting'),
  ('Low hanging fruits', 'meeting'),
  ('Best practice', 'meeting'),
  ('Win-win Situation', 'meeting'),
  ('Quick win', 'meeting'),
  ('Paradigmenwechsel', 'meeting'),
  ('Out of the box denken', 'meeting'),
  ('Agile arbeiten', 'meeting'),
  ('Deep dive', 'meeting'),
  ('Stakeholder abholen', 'meeting'),
  ('Pain points adressieren', 'meeting'),
  ('Roadmap erstellen', 'meeting'),
  ('Mehrwert schaffen', 'meeting'),
  ('Ressourcen buendeln', 'meeting'),
  ('Fokus setzen', 'meeting');
