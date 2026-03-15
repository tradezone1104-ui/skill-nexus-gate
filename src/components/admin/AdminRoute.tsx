import { Navigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAdmin();
  // Minimum display time prevents flash-redirect while async check is in-flight
  const [minWaitDone, setMinWaitDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinWaitDone(true), 1500);
    return () => clearTimeout(t);
  }, []);

  if (loading || !minWaitDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  console.log("[AdminRoute] loading done → isAdmin:", isAdmin);
  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}

