-- =====================================================
-- SCHÉMA COMPLET - Plateforme Accompagnement Immigration Canadienne
-- Sécurité : Row Level Security (RLS) activée partout
-- =====================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS
-- =====================================================
CREATE TYPE user_role AS ENUM ('client', 'admin');
CREATE TYPE application_status AS ENUM (
  'brouillon',
  'soumise',
  'en_examen',
  'infos_complementaires',
  'attente_reponse_client',
  'approuvee_interne',
  'refusee_interne',
  'cloturee'
);
CREATE TYPE immigration_program AS ENUM (
  'permanente',
  'travail',
  'etudes',
  'visite',
  'regroupement_familial',
  'affaires_investissement',
  'autre'
);
CREATE TYPE message_status AS ENUM ('en_attente', 'reponse_envoyee', 'cloturee');
CREATE TYPE family_role AS ENUM ('principal', 'conjoint', 'enfant', 'autre');

-- =====================================================
-- TABLES
-- =====================================================

-- Profils utilisateurs (lié à auth.users de Supabase)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'client',
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  place_of_birth TEXT,
  nationality TEXT,
  country_of_residence TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Programmes d'immigration (référentiel)
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code immigration_program NOT NULL UNIQUE,
  title_fr TEXT NOT NULL,
  description_fr TEXT NOT NULL,
  criteria_fr TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0
);

-- Candidatures
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_number TEXT NOT NULL UNIQUE, -- ex: CA-2026-000123
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program immigration_program NOT NULL,
  status application_status NOT NULL DEFAULT 'brouillon',
  is_family BOOLEAN NOT NULL DEFAULT FALSE,
  number_of_persons INT NOT NULL DEFAULT 1 CHECK (number_of_persons BETWEEN 1 AND 13),
  
  -- Profil candidat
  education_level TEXT,
  field_of_study TEXT,
  professional_experience TEXT,
  current_profession TEXT,
  languages TEXT[], -- ['fr', 'en', ...]
  french_level TEXT,
  english_level TEXT,
  budget_indicative TEXT,
  desired_departure_date DATE,
  preferred_city_province TEXT,
  
  -- Description libre
  project_description TEXT,
  
  -- Métadonnées
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Membres de la famille
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INT CHECK (age >= 0 AND age <= 120),
  relationship family_role NOT NULL,
  role_in_project TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- chemin dans Supabase Storage
  file_type TEXT,
  file_size INT,
  is_required BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Historique des statuts
CREATE TABLE status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  old_status application_status,
  new_status application_status NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notes administratives (confidentielles)
CREATE TABLE admin_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES profiles(id),
  note TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Conversations (messagerie)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  status message_status NOT NULL DEFAULT 'en_attente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  is_from_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Journal d'audit
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_number ON applications(application_number);
CREATE INDEX idx_family_members_app ON family_members(application_id);
CREATE INDEX idx_documents_app ON documents(application_id);
CREATE INDEX idx_conversations_client ON conversations(client_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_status_history_app ON status_history(application_id);

-- =====================================================
-- FONCTIONS UTILES
-- =====================================================

-- Génération du numéro de dossier unique
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT := to_char(NOW(), 'YYYY');
  seq INT;
  new_number TEXT;
BEGIN
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(application_number FROM 9) AS INT)
  ), 0) + 1 INTO seq
  FROM applications
  WHERE application_number LIKE 'CA-' || year_part || '-%';
  
  new_number := 'CA-' || year_part || '-' || LPAD(seq::TEXT, 6, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- POLITIQUES PROFILES
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- POLITIQUES APPLICATIONS
CREATE POLICY "Clients see only their applications"
  ON applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Clients can insert their applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Clients can update their draft applications"
  ON applications FOR UPDATE
  USING (auth.uid() = user_id AND status = 'brouillon');

CREATE POLICY "Admins full access applications"
  ON applications FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- POLITIQUES FAMILY_MEMBERS
CREATE POLICY "Clients manage own family members"
  ON family_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM applications a
      WHERE a.id = family_members.application_id AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins full access family"
  ON family_members FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- POLITIQUES DOCUMENTS
CREATE POLICY "Clients manage own documents"
  ON documents FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins full access documents"
  ON documents FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- POLITIQUES STATUS_HISTORY
CREATE POLICY "Clients view own history"
  ON status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications a
      WHERE a.id = status_history.application_id AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins full access history"
  ON status_history FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- POLITIQUES ADMIN_NOTES (uniquement admin)
CREATE POLICY "Only admins access notes"
  ON admin_notes FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- POLITIQUES CONVERSATIONS
CREATE POLICY "Clients see own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Clients create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Admins full access conversations"
  ON conversations FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- POLITIQUES MESSAGES
CREATE POLICY "Participants see messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.client_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
      ))
    )
  );

CREATE POLICY "Participants insert messages"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.client_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
      ))
    )
  );

-- POLITIQUES NOTIFICATIONS
CREATE POLICY "Users see own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- PROGRAMS (lecture publique)
CREATE POLICY "Anyone can read programs"
  ON programs FOR SELECT
  USING (is_active = TRUE);

-- AUDIT LOGS (admin only)
CREATE POLICY "Only admins access audit"
  ON audit_logs FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- SEED PROGRAMS
-- =====================================================
INSERT INTO programs (code, title_fr, description_fr, criteria_fr, sort_order) VALUES
('permanente', 'Immigration permanente', 
 'Accompagnement pour les programmes d''immigration économique permanente (Entrée Express, programmes provinciaux, etc.).',
 'Évaluation du profil CRS, expérience professionnelle, langues, études, etc.', 1),
('travail', 'Permis de travail', 
 'Accompagnement pour les demandes de permis de travail temporaire (LMIA, mobilité internationale, etc.).',
 'Offre d''emploi, catégorie d''exemption, qualifications.', 2),
('etudes', 'Études au Canada', 
 'Accompagnement pour les permis d''études et la préparation du dossier étudiant.',
 'Lettre d''acceptation, preuves financières, intention de retour.', 3),
('visite', 'Visite touristique / super visa', 
 'Accompagnement pour les visas de visiteur et super visas parents/grands-parents.',
 'Preuves de liens, moyens financiers, assurance médicale le cas échéant.', 4),
('regroupement_familial', 'Regroupement familial', 
 'Accompagnement pour le parrainage d''époux, enfants, parents ou grands-parents.',
 'Statut du parrain, preuves de relation, engagements financiers.', 5),
('affaires_investissement', 'Projet d''affaires ou d''investissement', 
 'Accompagnement pour les programmes entrepreneurs, investisseurs et start-up.',
 'Plan d''affaires, fonds disponibles, expérience entrepreneuriale.', 6),
('autre', 'Autres projets d''immigration', 
 'Pour les situations particulières non couvertes par les catégories précédentes.',
 'Analyse personnalisée selon le profil et les objectifs.', 7);
