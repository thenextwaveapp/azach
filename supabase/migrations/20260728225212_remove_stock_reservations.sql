drop function if exists reserve_stock(uuid, integer, text, integer);
drop function if exists release_reservation(text);
drop function if exists cleanup_expired_reservations();
drop function if exists get_available_stock(uuid);
drop table if exists stock_reservations;
;
