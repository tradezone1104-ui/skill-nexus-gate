import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAdmin() {
      if (!user) {
        if (isMounted) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      console.log("[useAdmin] Starting admin check for user:", user.id);

      try {
        // Step 1: Direct user_roles table query
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (roleError) {
          console.error("[useAdmin] roleError:", roleError.message);
        }

        if (roleData) {
          console.log("[useAdmin] ✅ Admin via user_roles table");
          if (isMounted) {
            setIsAdmin(true);
            setLoading(false);
          }
          return;
        }

        // Step 2: has_role RPC (SECURITY DEFINER — bypasses RLS)
        const { data: rpcData, error: rpcError } = await supabase
          .rpc("has_role", { _role: "admin", _user_id: user.id });

        if (rpcError) {
          console.error("[useAdmin] rpcError:", rpcError.message);
        }

        if (isMounted) {
          const result = !rpcError && rpcData === true;
          console.log("[useAdmin] Final result → isAdmin=", result);
          setIsAdmin(result);
          setLoading(false);
        }
      } catch (err) {
        console.error("[useAdmin] unexpected error:", err);
        if (isMounted) {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    }

    if (!authLoading) {
      checkAdmin();
    } else {
      setLoading(true);
    }

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  return { isAdmin, loading: loading || authLoading };
}
