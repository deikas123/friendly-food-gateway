
import React, { createContext, useContext, useState, useEffect } from "react";
import { CartContextType, Product, CartItem, Order } from "../types";
import { toast } from "@/components/ui/use-toast";
import { createOrder, CreateOrderInput } from "@/services/orderService";
import { convertToOrder } from "@/utils/typeConverters";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error parsing saved cart:", error);
        localStorage.removeItem('cartItems');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(items));
  }, [items]);
  
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addItem = (productOrCartItem: Product | CartItem, quantity = 1) => {
    setItems((prevItems) => {
      // Check if we're adding a CartItem or a Product
      const isCartItem = 'quantity' in productOrCartItem;
      const product = isCartItem ? (productOrCartItem as CartItem).product : productOrCartItem as Product;
      const quantityToAdd = isCartItem ? (productOrCartItem as CartItem).quantity : quantity;
      
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantityToAdd } 
            : item
        );
      } else {
        return [...prevItems, { product, quantity: quantityToAdd }];
      }
    });
    
    const product = 'quantity' in productOrCartItem 
      ? (productOrCartItem as CartItem).product 
      : productOrCartItem as Product;
    
    toast({
      title: "Added to cart",
      description: `${quantity} × ${product.name} added to your cart`,
      duration: 3000,
    });
  };

  const removeItem = (productId: string) => {
    setItems((prevItems) => prevItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setItems((prevItems) => 
      prevItems.map(item => 
        item.product.id === productId 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cartItems');
  };

  const checkout = async (
    userId: string,
    deliveryAddress: Order["deliveryAddress"],
    deliveryMethod: Order["deliveryMethod"],
    paymentMethod: Order["paymentMethod"],
    notes?: string
  ): Promise<Order> => {
    if (items.length === 0) {
      throw new Error("Cannot checkout with an empty cart");
    }

    const orderItems = items.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.image
    }));

    const subtotal = total;
    const deliveryFee = deliveryMethod.price;
    const orderTotal = subtotal + deliveryFee;

    // Convert from Order types to OrderType/CreateOrderInput types
    const orderData: CreateOrderInput = {
      user_id: userId,
      items: orderItems,
      delivery_address: {
        street: deliveryAddress.street,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        zipCode: deliveryAddress.zipCode
      },
      delivery_method: {
        id: deliveryMethod.id,
        name: deliveryMethod.name,
        price: deliveryMethod.price,
        estimatedDays: parseInt(deliveryMethod.estimatedDelivery) || 3
      },
      payment_method: {
        id: paymentMethod.id,
        name: paymentMethod.name
      },
      subtotal,
      delivery_fee: deliveryFee,
      total: orderTotal,
      notes,
      estimated_delivery: deliveryMethod.estimatedDelivery
    };

    const orderResult = await createOrder(orderData);
    clearCart();
    return convertToOrder(orderResult);
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        checkout,
        itemCount,
        total
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
