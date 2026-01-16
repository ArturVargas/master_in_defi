-- Schema para POAP Claims, Drops, Protocolos y Preguntas
-- Base de datos: Neon PostgreSQL

-- ============================================
-- TABLA DE QUIZ TOKENS (para persistencia en desarrollo)
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_tokens (
  token VARCHAR(128) PRIMARY KEY,
  protocol_id VARCHAR(50) NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  verification_method VARCHAR(20),
  wallet_address VARCHAR(255),
  email VARCHAR(255),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index para limpiar tokens expirados
CREATE INDEX IF NOT EXISTS idx_quiz_tokens_expires ON quiz_tokens(expires_at);

-- Comments
COMMENT ON TABLE quiz_tokens IS 'Temporary storage for quiz result tokens';
COMMENT ON COLUMN quiz_tokens.token IS 'Unique token for accessing quiz results';
COMMENT ON COLUMN quiz_tokens.expires_at IS 'When this token expires';

-- ============================================
-- TABLA DE PROTOCOLOS
-- ============================================
CREATE TABLE IF NOT EXISTS protocols (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  logo_url VARCHAR(512),
  category VARCHAR(50),
  difficulty VARCHAR(20),
  secret_word VARCHAR(100),
  status VARCHAR(10) DEFAULT 'public' CHECK (status IN ('public', 'draft')),
  active BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes para protocols
CREATE INDEX IF NOT EXISTS idx_protocols_active ON protocols(active);
CREATE INDEX IF NOT EXISTS idx_protocols_status ON protocols(status);
CREATE INDEX IF NOT EXISTS idx_protocols_category ON protocols(category);
CREATE INDEX IF NOT EXISTS idx_protocols_order ON protocols(order_index);

-- Comments para protocols
COMMENT ON TABLE protocols IS 'Stores DeFi protocol information';
COMMENT ON COLUMN protocols.id IS 'Protocol identifier (aave, morpho, sablier)';
COMMENT ON COLUMN protocols.secret_word IS 'Secret word revealed after passing quiz';
COMMENT ON COLUMN protocols.status IS 'Protocol visibility: public (visible) or draft (hidden)';
COMMENT ON COLUMN protocols.order_index IS 'Display order in the UI';

-- ============================================
-- TABLA DE PREGUNTAS
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id VARCHAR(50) NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  explanation TEXT,
  order_index INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes para questions
CREATE INDEX IF NOT EXISTS idx_questions_protocol ON questions(protocol_id);
CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(active);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(protocol_id, order_index);

-- Comments para questions
COMMENT ON TABLE questions IS 'Stores quiz questions for each protocol';
COMMENT ON COLUMN questions.protocol_id IS 'Foreign key to protocols table';
COMMENT ON COLUMN questions.explanation IS 'Explanation shown after answering';
COMMENT ON COLUMN questions.order_index IS 'Question order within the quiz';

-- ============================================
-- TABLA DE RESPUESTAS
-- ============================================
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes para answers
CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_order ON answers(question_id, order_index);

-- Comments para answers
COMMENT ON TABLE answers IS 'Stores answer options for quiz questions';
COMMENT ON COLUMN answers.question_id IS 'Foreign key to questions table';
COMMENT ON COLUMN answers.is_correct IS 'Whether this is the correct answer';
COMMENT ON COLUMN answers.order_index IS 'Answer display order';

-- ============================================
-- TABLA DE DROPS (eventos POAP creados)
-- ============================================
CREATE TABLE IF NOT EXISTS poap_drops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(512),
  event_id INTEGER NOT NULL UNIQUE,
  secret_code VARCHAR(50),
  expiry_date TIMESTAMP NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  quiz_title VARCHAR(255),
  quiz_subtitle VARCHAR(255),
  passing_percentage INTEGER DEFAULT 75,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes para drops
CREATE INDEX IF NOT EXISTS idx_poap_drops_protocol ON poap_drops(protocol_id);
CREATE INDEX IF NOT EXISTS idx_poap_drops_event ON poap_drops(event_id);
CREATE INDEX IF NOT EXISTS idx_poap_drops_active ON poap_drops(active);

-- Comments para drops
COMMENT ON TABLE poap_drops IS 'Stores POAP drops/events created for each protocol';
COMMENT ON COLUMN poap_drops.protocol_id IS 'Protocol identifier (aave, morpho, sablier) - unique per protocol';
COMMENT ON COLUMN poap_drops.event_id IS 'POAP event ID from POAP.xyz API';
COMMENT ON COLUMN poap_drops.secret_code IS 'Secret code to edit drop later';
COMMENT ON COLUMN poap_drops.passing_percentage IS 'Minimum percentage required to claim POAP';

-- Tabla de Claims (reclamaciones de POAP)
CREATE TABLE IF NOT EXISTS poap_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id VARCHAR(50) NOT NULL,
  wallet_address VARCHAR(42) NOT NULL,
  email VARCHAR(255),
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  verification_method VARCHAR(20),
  verification_id VARCHAR(255),
  poap_event_id INTEGER NOT NULL,
  poap_claim_code VARCHAR(255),
  poap_claim_url VARCHAR(512),
  claimed BOOLEAN DEFAULT FALSE,
  quiz_token VARCHAR(128) UNIQUE,
  completed_at TIMESTAMP NOT NULL,
  claimed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Prevent duplicate claims per protocol per wallet
  CONSTRAINT unique_protocol_wallet UNIQUE(protocol_id, wallet_address)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_poap_claims_wallet ON poap_claims(wallet_address);
CREATE INDEX IF NOT EXISTS idx_poap_claims_protocol ON poap_claims(protocol_id);
CREATE INDEX IF NOT EXISTS idx_poap_claims_token ON poap_claims(quiz_token);
CREATE INDEX IF NOT EXISTS idx_poap_claims_completed_at ON poap_claims(completed_at DESC);

-- Comments for documentation
COMMENT ON TABLE poap_claims IS 'Stores POAP claim records for quiz completions';
COMMENT ON COLUMN poap_claims.protocol_id IS 'Protocol identifier (aave, morpho, sablier)';
COMMENT ON COLUMN poap_claims.wallet_address IS 'User wallet address (from verification)';
COMMENT ON COLUMN poap_claims.score IS 'Quiz score (number of correct answers)';
COMMENT ON COLUMN poap_claims.passed IS 'Whether user passed (score >= 3)';
COMMENT ON COLUMN poap_claims.verification_method IS 'Verification type: self or wallet';
COMMENT ON COLUMN poap_claims.poap_event_id IS 'POAP event ID from POAP.xyz';
COMMENT ON COLUMN poap_claims.poap_claim_code IS 'POAP claim code (qr_hash)';
COMMENT ON COLUMN poap_claims.poap_claim_url IS 'Full POAP claim URL';
COMMENT ON COLUMN poap_claims.quiz_token IS 'Temporary quiz token (for security)';
