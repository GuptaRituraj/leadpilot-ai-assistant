CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  email TEXT,
  lead_source TEXT CHECK (lead_source IN ('WhatsApp','LinkedIn','Referral','Website','Call','Email','Other')),
  interest TEXT,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New','Contacted','Qualified','Proposal Sent','Won','Lost')),
  follow_up_date DATE,
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low','Medium','High')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo open access" ON public.leads FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  activity_type TEXT,
  activity_note TEXT,
  activity_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_activities TO anon, authenticated;
GRANT ALL ON public.lead_activities TO service_role;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo open access" ON public.lead_activities FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  lead_summary TEXT,
  current_status_summary TEXT,
  risk_or_opportunity TEXT,
  suggested_next_step TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_summaries TO anon, authenticated;
GRANT ALL ON public.ai_summaries TO service_role;
ALTER TABLE public.ai_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo open access" ON public.ai_summaries FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.ai_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  task_title TEXT,
  task_reason TEXT,
  recommended_action TEXT,
  priority TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open','Done','Dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_tasks TO anon, authenticated;
GRANT ALL ON public.ai_tasks TO service_role;
ALTER TABLE public.ai_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo open access" ON public.ai_tasks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  message_type TEXT CHECK (message_type IN ('WhatsApp','Email','Short Follow-up','Professional Follow-up')),
  generated_message TEXT,
  tone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_messages TO anon, authenticated;
GRANT ALL ON public.ai_messages TO service_role;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo open access" ON public.ai_messages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.voice_agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT,
  answer TEXT,
  related_lead_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.voice_agent_logs TO anon, authenticated;
GRANT ALL ON public.voice_agent_logs TO service_role;
ALTER TABLE public.voice_agent_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo open access" ON public.voice_agent_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_follow_up_date ON public.leads(follow_up_date);
CREATE INDEX idx_leads_lead_source ON public.leads(lead_source);
CREATE INDEX idx_leads_priority ON public.leads(priority);
CREATE INDEX idx_lead_activities_lead_id ON public.lead_activities(lead_id);
CREATE INDEX idx_ai_summaries_lead_id ON public.ai_summaries(lead_id);
CREATE INDEX idx_ai_tasks_lead_id ON public.ai_tasks(lead_id);
CREATE INDEX idx_ai_messages_lead_id ON public.ai_messages(lead_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER ai_summaries_updated_at BEFORE UPDATE ON public.ai_summaries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER ai_tasks_updated_at BEFORE UPDATE ON public.ai_tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER ai_messages_updated_at BEFORE UPDATE ON public.ai_messages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.leads (name, company, phone, email, lead_source, interest, status, follow_up_date, priority, notes) VALUES
('Rahul Sharma','Sharma Textiles','+91 98200 11223','rahul@sharmatex.in','WhatsApp','Bulk order automation','Qualified', CURRENT_DATE, 'High','Asked for pricing sheet, budget approved.'),
('Ananya Iyer','Bloom Studio','+91 99876 55441','ananya@bloomstudio.co','Website','Website redesign','Contacted', CURRENT_DATE - 3, 'Medium','Wants a quote before month end.'),
('David Chen','Northwind Labs','+1 415 555 0134','david@northwind.io','LinkedIn','CRM migration','Proposal Sent', CURRENT_DATE + 2, 'High','Proposal sent, awaiting legal review.'),
('Meera Nair','Freelance','+91 90000 12345','meera.nair@gmail.com','Referral','Coaching package','New', CURRENT_DATE + 5, 'Low','Referred by Rahul.');

INSERT INTO public.lead_activities (lead_id, activity_type, activity_note, activity_date)
SELECT id, 'Call', 'Intro call done, discussed requirements.', CURRENT_DATE - 4 FROM public.leads WHERE name = 'Rahul Sharma';
INSERT INTO public.lead_activities (lead_id, activity_type, activity_note, activity_date)
SELECT id, 'WhatsApp', 'Shared pricing sheet on WhatsApp.', CURRENT_DATE - 1 FROM public.leads WHERE name = 'Rahul Sharma';
INSERT INTO public.lead_activities (lead_id, activity_type, activity_note, activity_date)
SELECT id, 'Email', 'Sent proposal PDF.', CURRENT_DATE - 2 FROM public.leads WHERE name = 'David Chen';