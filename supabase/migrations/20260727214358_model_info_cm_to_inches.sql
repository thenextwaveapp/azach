update products
set model_info = jsonb_strip_nulls(jsonb_build_object(
  'height_in', round((model_info->>'height_cm')::numeric / 2.54, 1),
  'bust_in', round((model_info->>'bust_cm')::numeric / 2.54, 1),
  'waist_in', round((model_info->>'waist_cm')::numeric / 2.54, 1),
  'hips_in', round((model_info->>'hips_cm')::numeric / 2.54, 1),
  'wearing_size', model_info->>'wearing_size'
))
where model_info is not null and model_info != '{}'::jsonb;
;
