// Replaced Lovable proprietary auth with native Supabase OAuth.
// All Google sign-in now goes directly through Supabase.

import { supabase } from "../supabase/client";

type SignInOptions = {
  redirectTo?: string;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple", opts?: SignInOptions) => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: opts?.redirectTo ?? window.location.origin,
        },
      });

      if (error) {
        return { error };
      }

      return { error: null };
    },
  },
};
