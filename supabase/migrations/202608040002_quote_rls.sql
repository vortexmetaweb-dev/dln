-- ===========================================================
-- HABILITA RLS Y POLÍTICAS PARA LAS 3 TABLAS DE COTIZACIONES
-- Requerido para que funcionen UPDATE + DELETE child rows en la
-- acción de Editar cotización. Las políticas siguen la regla:
--   * Un usuario normal puede modificar SUS cotizaciones.
--   * Un usuario con role = 'Admin' puede ver/modificar TODAS.
-- ===========================================================

ALTER TABLE public.maritime_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maritime_quote_charge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maritime_quote_other_items ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------
-- Helper inline: rol Admin sobre profiles
-- -----------------------------------------------------------

-- ===========================================================
-- 1) public.maritime_quotes
-- ===========================================================

DROP POLICY IF EXISTS "quotes_select_own_or_admin" ON public.maritime_quotes;
CREATE POLICY "quotes_select_own_or_admin"
ON public.maritime_quotes
FOR SELECT
TO authenticated
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'Admin'
  )
);

DROP POLICY IF EXISTS "quotes_insert_authenticated" ON public.maritime_quotes;
CREATE POLICY "quotes_insert_authenticated"
ON public.maritime_quotes
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "quotes_update_own_or_admin" ON public.maritime_quotes;
CREATE POLICY "quotes_update_own_or_admin"
ON public.maritime_quotes
FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'Admin'
  )
)
WITH CHECK (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'Admin'
  )
);

DROP POLICY IF EXISTS "quotes_delete_own_or_admin" ON public.maritime_quotes;
CREATE POLICY "quotes_delete_own_or_admin"
ON public.maritime_quotes
FOR DELETE
TO authenticated
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'Admin'
  )
);

-- ===========================================================
-- 2) public.maritime_quote_charge_items
--    Hereda el permiso del encabezado (quote_id → maritime_quotes)
-- ===========================================================

DROP POLICY IF EXISTS "quote_charge_select_parent" ON public.maritime_quote_charge_items;
CREATE POLICY "quote_charge_select_parent"
ON public.maritime_quote_charge_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.maritime_quotes q
    WHERE q.id = quote_id
      AND (
        q.created_by = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.profiles p
          WHERE p.id = auth.uid()
            AND p.role = 'Admin'
        )
      )
  )
);

DROP POLICY IF EXISTS "quote_charge_insert_parent" ON public.maritime_quote_charge_items;
CREATE POLICY "quote_charge_insert_parent"
ON public.maritime_quote_charge_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.maritime_quotes q
    WHERE q.id = quote_id
      AND (
        q.created_by = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.profiles p
          WHERE p.id = auth.uid()
            AND p.role = 'Admin'
        )
      )
  )
);

DROP POLICY IF EXISTS "quote_charge_update_parent" ON public.maritime_quote_charge_items;
CREATE POLICY "quote_charge_update_parent"
ON public.maritime_quote_charge_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.maritime_quotes q
    WHERE q.id = quote_id
      AND (
        q.created_by = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.profiles p
          WHERE p.id = auth.uid()
            AND p.role = 'Admin'
        )
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.maritime_quotes q
    WHERE q.id = quote_id
      AND (
        q.created_by = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.profiles p
          WHERE p.id = auth.uid()
            AND p.role = 'Admin'
        )
      )
  )
);

DROP POLICY IF EXISTS "quote_charge_delete_parent" ON public.maritime_quote_charge_items;
CREATE POLICY "quote_charge_delete_parent"
ON public.maritime_quote_charge_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.maritime_quotes q
    WHERE q.id = quote_id
      AND (
        q.created_by = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.profiles p
          WHERE p.id = auth.uid()
            AND p.role = 'Admin'
        )
      )
  )
);

-- ===========================================================
-- 3) public.maritime_quote_other_items
-- ===========================================================

DROP POLICY IF EXISTS "quote_other_select_parent" ON public.maritime_quote_other_items;
CREATE POLICY "quote_other_select_parent"
ON public.maritime_quote_other_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.maritime_quotes q
    WHERE q.id = quote_id
      AND (
        q.created_by = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.profiles p
          WHERE p.id = auth.uid()
            AND p.role = 'Admin'
        )
      )
  )
);

DROP POLICY IF EXISTS "quote_other_insert_parent" ON public.maritime_quote_other_items;
CREATE POLICY "quote_other_insert_parent"
ON public.maritime_quote_other_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.maritime_quotes q
    WHERE q.id = quote_id
      AND (
        q.created_by = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.profiles p
          WHERE p.id = auth.uid()
            AND p.role = 'Admin'
        )
      )
  )
);

DROP POLICY IF EXISTS "quote_other_update_parent" ON public.maritime_quote_other_items;
CREATE POLICY "quote_other_update_parent"
ON public.maritime_quote_other_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.maritime_quotes q
    WHERE q.id = quote_id
      AND (
        q.created_by = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.profiles p
          WHERE p.id = auth.uid()
            AND p.role = 'Admin'
        )
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.maritime_quotes q
    WHERE q.id = quote_id
      AND (
        q.created_by = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.profiles p
          WHERE p.id = auth.uid()
            AND p.role = 'Admin'
        )
      )
  )
);

DROP POLICY IF EXISTS "quote_other_delete_parent" ON public.maritime_quote_other_items;
CREATE POLICY "quote_other_delete_parent"
ON public.maritime_quote_other_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.maritime_quotes q
    WHERE q.id = quote_id
      AND (
        q.created_by = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.profiles p
          WHERE p.id = auth.uid()
            AND p.role = 'Admin'
        )
      )
  )
);
