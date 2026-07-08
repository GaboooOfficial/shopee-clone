import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CartState } from './cart.reducer';

export const selectCartState = createFeatureSelector<CartState>('cart');

export const selectCartItems = createSelector(
  selectCartState,
  (state: CartState) => state.items
);

export const selectCartItemsCount = createSelector(
  selectCartItems,
  (items) => items.reduce((sum, item) => sum + item.quantity, 0)
);

export const selectCartTotal = createSelector(
  selectCartItems,
  (items) => items.reduce((sum, item) => sum + item.price * item.quantity, 0)
);
