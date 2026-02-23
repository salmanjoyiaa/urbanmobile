-- =============================================
-- Migration 14: Allow 'reschedule' Visiting Status
-- =============================================

-- Drop the existing check constraint for explicit pipeline
ALTER TABLE visit_requests DROP CONSTRAINT IF EXISTS visit_requests_visiting_status_check;

-- Add updated check constraint including 'reschedule'
ALTER TABLE visit_requests ADD CONSTRAINT visit_requests_visiting_status_check CHECK (
    visiting_status IN (
        'view',
        'visit_done',
        'customer_remarks',
        'deal_pending',
        'deal_fail',
        'commission_got',
        'deal_close',
        'reschedule'
    )
);
