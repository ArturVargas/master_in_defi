-- Migration: Add status column to protocols table
-- Date: 2026-01-16
-- Description: Add status field to support public/draft protocol states

-- Add status column with default value 'public'
ALTER TABLE protocols
ADD COLUMN IF NOT EXISTS status VARCHAR(10) DEFAULT 'public';

-- Add check constraint to ensure only valid values
ALTER TABLE protocols
ADD CONSTRAINT check_protocol_status CHECK (status IN ('public', 'draft'));

-- Create index for filtering by status
CREATE INDEX IF NOT EXISTS idx_protocols_status ON protocols(status);

-- Add comment for documentation
COMMENT ON COLUMN protocols.status IS 'Protocol visibility status: public (visible to users) or draft (hidden)';

-- Update existing rows to have 'public' status if null
UPDATE protocols
SET status = 'public'
WHERE status IS NULL;

-- Summary: This migration adds a status field to control protocol visibility
-- - 'public': Protocol is visible to all users
-- - 'draft': Protocol is hidden from public view (admin only)
