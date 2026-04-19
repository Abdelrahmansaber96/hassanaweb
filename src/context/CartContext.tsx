"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { type Product, type CartItem } from "@/lib/products";

const CART_STORAGE_KEY = "hassana_cart";
const CART_STORAGE_EVENT = "hassana-cart-updated";
const EMPTY_CART: CartItem[] = [];

let cachedCartRaw = "";
let cachedCartItems: CartItem[] = EMPTY_CART;

function readStoredCartItems(): CartItem[] {
  if (typeof window === "undefined") {
    return EMPTY_CART;
  }

  try {
    const saved = window.localStorage.getItem(CART_STORAGE_KEY) ?? "";

    if (saved === cachedCartRaw) {
      return cachedCartItems;
    }

    cachedCartRaw = saved;
    cachedCartItems = saved ? (JSON.parse(saved) as CartItem[]) : EMPTY_CART;

    return cachedCartItems;
  } catch {
    cachedCartRaw = "";
    cachedCartItems = EMPTY_CART;
    return EMPTY_CART;
  }
}

function writeStoredCartItems(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  const serialized = JSON.stringify(items);
  cachedCartRaw = serialized;
  cachedCartItems = items;
  window.localStorage.setItem(CART_STORAGE_KEY, serialized);
  window.dispatchEvent(new Event(CART_STORAGE_EVENT));
}

function subscribeToCartStore(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === CART_STORAGE_KEY) {
      onStoreChange();
    }
  };

  const handleManualUpdate = () => {
    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(CART_STORAGE_EVENT, handleManualUpdate);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CART_STORAGE_EVENT, handleManualUpdate);
  };
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    subscribeToCartStore,
    readStoredCartItems,
    () => EMPTY_CART
  );
  const [isOpen, setIsOpen] = useState(false);

  const updateItems = useCallback(
    (updater: (currentItems: CartItem[]) => CartItem[]) => {
      writeStoredCartItems(updater(readStoredCartItems()));
    },
    []
  );

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback((product: Product, quantity = 1) => {
    updateItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsOpen(true);
  }, [updateItems]);

  const removeItem = useCallback((productId: string) => {
    updateItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, [updateItems]);

  const updateQty = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) return;
    updateItems((prev) =>
      prev.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      )
    );
  }, [updateItems]);

  const clearCart = useCallback(() => writeStoredCartItems([]), []);

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        totalCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
