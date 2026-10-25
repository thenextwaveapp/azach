select cron.schedule(
  'send-abandoned-cart-emails-hourly',
  '0 * * * *',
  $$
  select net.http_post(
    url := 'https://oomypczpxxpechltrqmq.supabase.co/functions/v1/send-abandoned-cart-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
    )
  );
  $$
);
;
