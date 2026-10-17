import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(() => {
    try {
      const storedUser = sessionStorage.getItem("cravingUser");
      if (!storedUser) return [];
      const storedCart = localStorage.getItem("cravingsCart");
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (e) {
      return [];
    }
  });

  // Automatically clear cart when user logs out
  useEffect(() => {
    if (!user) {
      setCart([]);
      localStorage.removeItem("cravingsCart");
    }
  }, [user]);

  useEffect(() => {
    if (user && cart.length > 0) {
      localStorage.setItem("cravingsCart", JSON.stringify(cart));
    } else if (!user || cart.length === 0) {
      localStorage.removeItem("cravingsCart");
    }
  }, [cart, user]);

  const getCartQuantity = (itemId) => {
    const cartItem = cart.find((c) => c.item._id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = (item) => {
    if (!user) {
      toast.error("Please login first to add items to cart");
      return;
    }
    // Prevent adding from different restaurants without user confirmation
    if (cart.length > 0 && cart[0].item.restaurantId !== item.restaurantId) {
      const confirmClear = window.confirm("Your cart contains items from another restaurant. Do you want to clear it and add this item instead?");
      if (confirmClear) {
        setCart([{ item, quantity: 1 }]);
        toast.success("Cart cleared and new item added!");
      }
      return;
    }
    
    // Check if already in cart, if yes, just increase quantity
    const existing = cart.find(c => c.item._id === item._id);
    if(existing) {
       handleRemoveFromCart(item, true);
       return;
    }

    setCart([...cart, { item, quantity: 1 }]);
    toast.success("Added to cart");
  };

  const handleRemoveFromCart = (item, isAdding = true) => {
    const existing = cart.find((c) => c.item._id === item._id);
    
    if (!existing && !isAdding) return;
    
    if (!existing && isAdding) {
      toast.success("Added to cart");
      setCart([...cart, { item, quantity: 1 }]);
      return;
    }

    if (isAdding) {
      setCart(cart.map((c) =>
        c.item._id === item._id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      if (existing.quantity === 1) {
        toast.success("Removed from cart");
        setCart(cart.filter((c) => c.item._id !== item._id));
      } else {
        setCart(cart.map((c) =>
          c.item._id === item._id ? { ...c, quantity: c.quantity - 1 } : c
        ));
      }
    }
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cravingsCart");
  };

  const totalItems = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalAmount = cart.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        getCartQuantity,
        handleAddToCart,
        handleRemoveFromCart,
        clearCart,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
