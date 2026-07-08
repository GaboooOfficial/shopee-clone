import { createReducer, on } from '@ngrx/store';
import * as CartActions from './cart.actions';

export interface CartState {
  items: any[];
}

export const initialCartState: CartState = {
  items: localStorage.getItem('shopee_cart')
    ? JSON.parse(localStorage.getItem('shopee_cart')!)
    : []
};

function saveCart(items: any[]) {
  localStorage.setItem('shopee_cart', JSON.stringify(items));
}

export const cartReducer = createReducer(
  initialCartState,
  on(CartActions.loadCartFromStorage, (state) => {
    const saved = localStorage.getItem('shopee_cart');
    return {
      ...state,
      items: saved ? JSON.parse(saved) : []
    };
  }),
  on(CartActions.addToCart, (state, { product }) => {
    const existingIndex = state.items.findIndex(
      (item) => item.productId === product._id
    );
    let updatedItems = [...state.items];
    if (existingIndex > -1) {
      if (updatedItems[existingIndex].quantity < product.stock) {
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + 1
        };
      }
    } else {
      updatedItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock: product.stock,
        imageUrl: product.imageUrl,
        storeName: product.storeId?.name || product.storeName,
      });
    }
    saveCart(updatedItems);
    return {
      ...state,
      items: updatedItems
    };
  }),
  on(CartActions.removeFromCart, (state, { index }) => {
    const updatedItems = state.items.filter((_, i) => i !== index);
    saveCart(updatedItems);
    return {
      ...state,
      items: updatedItems
    };
  }),
  on(CartActions.updateCartQuantity, (state, { index, quantity }) => {
    const updatedItems = state.items.map((item, i) => {
      if (i === index) {
        let newQty = Number(quantity);
        if (newQty > item.stock) newQty = item.stock;
        if (newQty < 1) newQty = 1;
        return { ...item, quantity: newQty };
      }
      return item;
    });
    saveCart(updatedItems);
    return {
      ...state,
      items: updatedItems
    };
  }),
  on(CartActions.clearCart, (state) => {
    saveCart([]);
    return {
      ...state,
      items: []
    };
  })
);
