ALTER TABLE public.discount_codes
  ADD COLUMN issued_to_email text;

COMMENT ON COLUMN public.discount_codes.issued_to_email IS
  'Email this single-use code was minted for (welcome-popup codes). Null for shared/manual codes.';

CREATE INDEX idx_discount_codes_issued_to_email
  ON public.discount_codes (issued_to_email)
  WHERE issued_to_email IS NOT NULL;;
