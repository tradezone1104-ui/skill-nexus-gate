import { createContext, useContext, ReactNode } from "react";
import { useWishlist } from "@/hooks/useWishlist";

type WishlistContextType = ReturnType<typeof useWishlist>;

const WishlistContext = createContext<WishlistContextType>({
  wishlistIds: new Set(),
  loading: false,
  toggleWishlist: async () => {},
  isWishlisted: () => false,
  refetch: async () => {},
});

export const useWishlistContext = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const wishlist = useWishlist();
  return <WishlistContext.Provider value={wishlist}>{children}</WishlistContext.Provider>;
};
