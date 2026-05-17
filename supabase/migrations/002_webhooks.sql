-- ============================================================
-- ORDMORA — Webhooks & Cron
-- Run AFTER deploying the Edge Functions
-- ============================================================

-- Trigger WhatsApp notification when order status changes
-- Replace YOUR_PROJECT_REF with your actual Supabase project ref
select
  net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-whatsapp',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body := json_build_object('record', NEW, 'old_record', OLD)::text
  )
from pg_catalog.pg_tables
where false; -- placeholder, actual webhook set in Supabase Dashboard

-- NOTE: Set up the webhook in Supabase Dashboard:
-- Database → Webhooks → New Webhook
--   Table: orders
--   Events: UPDATE
--   URL: https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-whatsapp
--   HTTP Method: POST

-- Daily cron for point expiry (set in Supabase Dashboard → Edge Functions → Schedules)
-- Schedule: 0 2 * * *  (2am daily)
-- Function: expire-points
-- Headers: Authorization: Bearer YOUR_CRON_SECRET
