
-- Allow admin to delete exchange requests
CREATE POLICY "Admin delete exchange_reqs"
ON public.exchange_requests
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admin to delete sell requests
CREATE POLICY "Admin delete sell_reqs"
ON public.sell_requests
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
