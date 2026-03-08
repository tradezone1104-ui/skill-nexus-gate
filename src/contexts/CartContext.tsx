import { createContext, useContext, ReactNode } from "react";
import { useCart } from "@/hooks/useCart";

type CartContextType = ReturnType<typeof useCart>;

const CartContext = createContext<CartContextType>({
  cartIds: new Set(),
  cartCount: 0,
  loading: false,
  addToCart: async () => {},
  removeFromCart: async () => {},
  isInCart: () => false,
  refetch: async () => {},
});

export const useCartContext = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const cart = useCart();
  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
};
