update products
set image_url = regexp_replace(image_url, '\.(png|PNG|jpe?g|JPE?G)$', '.webp')
where image_url like '%/product-images/products/%';

update products
set image_urls = (
  select array_agg(regexp_replace(u, '\.(png|PNG|jpe?g|JPE?G)$', '.webp'))
  from unnest(image_urls) as u
)
where image_urls is not null;
;
