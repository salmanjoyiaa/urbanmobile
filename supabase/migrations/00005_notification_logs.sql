create table if not exists notification_logs (
  id uuid default gen_random_uuid() primary key,
  channel text not null, -- 'email' | 'whatsapp'
  recipient text not null,
  subject text,
  content text,
  status text not null, -- 'sent' | 'failed'
  error_message text,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table notification_logs enable row level security;

-- Only admins can view logs
create policy "Admins can view all notification logs"
  on notification_logs for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Only service role can insert (implicit, no policy needed for service role)
-- But if we want to support client-side logging (unlikely for this sensitive data), we'd add it.
-- For now, purely backend logging via Service Role is safest.
