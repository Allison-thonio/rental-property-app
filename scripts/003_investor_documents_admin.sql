-- Add investor role to user_type and add admin flag
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ban_reason TEXT,
ADD COLUMN IF NOT EXISTS ban_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS suspicion_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_suspicious_activity TIMESTAMP WITH TIME ZONE;

-- Create documents table for property verification
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('title_deed', 'national_id', 'proof_of_ownership', 'utility_bill', 'certificate_of_occupancy', 'survey_plan')),
  document_url TEXT NOT NULL,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create investments table
CREATE TABLE IF NOT EXISTS public.investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  investment_amount DECIMAL(12, 2) NOT NULL,
  investment_type TEXT CHECK (investment_type IN ('fixed_return', 'equity', 'negotiated')) DEFAULT 'negotiated',
  expected_return DECIMAL(5, 2),
  investment_term_months INTEGER,
  status TEXT CHECK (status IN ('proposed', 'accepted', 'active', 'completed')) DEFAULT 'proposed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create investor_conversations table for multi-party chats
CREATE TABLE IF NOT EXISTS public.investor_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  investment_id UUID NOT NULL REFERENCES public.investments(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  flagged_by_admin BOOLEAN DEFAULT FALSE,
  admin_flag_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create admin_logs table for audit trail
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('account_banned', 'account_verified', 'document_approved', 'document_rejected', 'chat_flagged', 'chat_reviewed', 'fraud_alert', 'property_verified')),
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  target_document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create fraud_flags table for suspicious activity tracking
CREATE TABLE IF NOT EXISTS public.fraud_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  flag_type TEXT NOT NULL CHECK (flag_type IN ('multiple_rejected_docs', 'rapid_escalation', 'unverified_claims', 'payment_anomaly', 'chat_suspicious_words', 'multiple_failed_transactions', 'fake_identity')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  description TEXT,
  automated BOOLEAN DEFAULT TRUE,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  resolved_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_flags ENABLE ROW LEVEL SECURITY;

-- Documents RLS
CREATE POLICY "documents_select_own_or_admin"
  ON public.documents FOR SELECT
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "documents_insert_own"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "documents_update_admin_only"
  ON public.documents FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Investments RLS
CREATE POLICY "investments_select_own_or_admin"
  ON public.investments FOR SELECT
  USING (
    auth.uid() IN (investor_id, seller_id) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "investments_insert_own"
  ON public.investments FOR INSERT
  WITH CHECK (auth.uid() = investor_id);

CREATE POLICY "investments_update_own_or_admin"
  ON public.investments FOR UPDATE
  USING (
    auth.uid() IN (investor_id, seller_id) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Investor conversations RLS
CREATE POLICY "investor_conversations_select_own_or_admin"
  ON public.investor_conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.investments i
      WHERE i.id = investor_conversations.investment_id
      AND (i.investor_id = auth.uid() OR i.seller_id = auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "investor_conversations_insert_own"
  ON public.investor_conversations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.investments i
      WHERE i.id = investor_conversations.investment_id
      AND (i.investor_id = auth.uid() OR i.seller_id = auth.uid())
    )
  );

-- Admin logs RLS (admin view only)
CREATE POLICY "admin_logs_select_admin_only"
  ON public.admin_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "admin_logs_insert_admin_only"
  ON public.admin_logs FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Fraud flags RLS
CREATE POLICY "fraud_flags_select_own_or_admin"
  ON public.fraud_flags FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "fraud_flags_insert_admin_only"
  ON public.fraud_flags FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );
