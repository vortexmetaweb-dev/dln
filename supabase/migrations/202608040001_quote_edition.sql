ALTER TABLE public.maritime_quotes
ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1;

ALTER TABLE public.maritime_quotes
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

COMMENT ON COLUMN public.maritime_quotes.version IS 'Número de versión de la cotización, empieza en 1 y se incrementa al editarla.';
COMMENT ON COLUMN public.maritime_quotes.edited_at IS 'Timestamp de la última edición efectiva (null si nunca fue editada).';

CREATE OR REPLACE FUNCTION public.increment_quote_version_on_update()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    NEW.issuer_trade_name IS DISTINCT FROM OLD.issuer_trade_name OR
    NEW.issuer_legal_name IS DISTINCT FROM OLD.issuer_legal_name OR
    NEW.issuer_rfc IS DISTINCT FROM OLD.issuer_rfc OR
    NEW.issuer_tax_address IS DISTINCT FROM OLD.issuer_tax_address OR
    NEW.issuer_phone IS DISTINCT FROM OLD.issuer_phone OR
    NEW.issuer_website IS DISTINCT FROM OLD.issuer_website OR
    NEW.issuer_seller_name IS DISTINCT FROM OLD.issuer_seller_name OR
    NEW.issuer_contact_email IS DISTINCT FROM OLD.issuer_contact_email OR
    NEW.client_company_name IS DISTINCT FROM OLD.client_company_name OR
    NEW.client_contact_name IS DISTINCT FROM OLD.client_contact_name OR
    NEW.route_origin_port IS DISTINCT FROM OLD.route_origin_port OR
    NEW.route_destination_port IS DISTINCT FROM OLD.route_destination_port OR
    NEW.route_incoterm IS DISTINCT FROM OLD.route_incoterm OR
    NEW.route_shipping_line IS DISTINCT FROM OLD.route_shipping_line OR
    NEW.route_free_days IS DISTINCT FROM OLD.route_free_days OR
    NEW.route_transit_time IS DISTINCT FROM OLD.route_transit_time OR
    NEW.quote_issue_date IS DISTINCT FROM OLD.quote_issue_date OR
    NEW.quote_valid_until IS DISTINCT FROM OLD.quote_valid_until OR
    NEW.quote_number IS DISTINCT FROM OLD.quote_number OR
    NEW.document_currencies IS DISTINCT FROM OLD.document_currencies OR
    NEW.totals IS DISTINCT FROM OLD.totals
  ) THEN
    NEW.version = COALESCE(OLD.version, 0) + 1;
    NEW.edited_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_increment_quote_version_on_update ON public.maritime_quotes;

CREATE TRIGGER trg_increment_quote_version_on_update
BEFORE UPDATE ON public.maritime_quotes
FOR EACH ROW
EXECUTE FUNCTION public.increment_quote_version_on_update();
