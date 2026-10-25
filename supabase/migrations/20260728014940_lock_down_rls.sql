alter table products_price_backup_20260621 enable row level security;

alter table admin_users enable row level security;

create policy "users can check their own admin status"
on admin_users for select
to authenticated
using (user_id = auth.uid());
;
