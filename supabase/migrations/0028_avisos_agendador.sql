create extension if not exists pg_net;
create extension if not exists pg_cron;

-- A cada 5 minutos o banco chama a função "avisos" (agenda lembretes e envia a fila).
select cron.schedule(
  'avisos-email',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://wscrerfcrfgcnglvsjtn.supabase.co/functions/v1/avisos',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-avisos-segredo', public.avisos_segredo()),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);
