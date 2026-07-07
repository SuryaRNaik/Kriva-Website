"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Toaster, toast } from 'react-hot-toast';

export type Product = {
  id: string;
  title: string;
  price: string;
  image: string;
  originalPrice?: string;
  subtitle?: string;
};

export type CartItem = Product & {
  quantity: number;
};

type StoreContextType = {
  cart: CartItem[];
  favorites: Product[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
  cartTotal: number;
  cartCount: number;
  clearCart: () => void;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("kriva_cart");
    const savedFavorites = localStorage.getItem("kriva_favorites");
    
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    
    setIsLoaded(true);
  }, []);

  // Save to local storage whenever state changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("kriva_cart", JSON.stringify(cart));
      localStorage.setItem("kriva_favorites", JSON.stringify(favorites));
    }
  }, [cart, favorites, isLoaded]);

  const addToCart = (product: Product, quantityToAdd: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantityToAdd } : item
        );
      }
      return [...prevCart, { ...product, quantity: quantityToAdd }];
    });
    
    toast.success("Added to cart", {
      style: {
        background: '#22c55e', // Green color
        color: '#fff',
        fontWeight: '500'
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#22c55e',
      },
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const toggleFavorite = (product: Product) => {
    setFavorites((prevFavs) => {
      const exists = prevFavs.some((fav) => fav.id === product.id);
      if (exists) {
        return prevFavs.filter((fav) => fav.id !== product.id);
      }
      return [...prevFavs, product];
    });
  };

  const isFavorite = (productId: string) => {
    return favorites.some((fav) => fav.id === productId);
  };

  // Helper to parse ₹ price strings like "₹2,500" into numbers
  const parsePrice = (priceStr: string) => {
    return Number(priceStr.replace(/[^0-9.-]+/g,""));
  };

  const cartTotal = cart.reduce((total, item) => total + parsePrice(item.price) * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        cart,
        favorites,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleFavorite,
        isFavorite,
        cartTotal,
        cartCount,
        clearCart,
      }}
    >
      <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
