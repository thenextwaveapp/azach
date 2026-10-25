update products
set measurements = jsonb_strip_nulls(jsonb_build_object(
  'chest_in', round((measurements->>'chest_cm')::numeric / 2.54, 1),
  'sleeve_in', round((measurements->>'sleeve_cm')::numeric / 2.54, 1),
  'waist_in', round((measurements->>'waist_cm')::numeric / 2.54, 1),
  'top_length_in', round((measurements->>'top_length_cm')::numeric / 2.54, 1),
  'bottom_length_in', round((measurements->>'bottom_length_cm')::numeric / 2.54, 1)
))
where measurements is not null and measurements != '{}'::jsonb;
;
