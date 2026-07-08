import { createAction, props } from '@ngrx/store';

export const loadCartFromStorage = createAction('[Cart] Load Cart From Storage');

export const addToCart = createAction(
  '[Cart] Add To Cart',
  props<{ product: any }>()
);

export const removeFromCart = createAction(
  '[Cart] Remove From Cart',
  props<{ index: number }>()
);

export const updateCartQuantity = createAction(
  '[Cart] Update Cart Quantity',
  props<{ index: number; quantity: number }>()
);

export const clearCart = createAction('[Cart] Clear Cart');
