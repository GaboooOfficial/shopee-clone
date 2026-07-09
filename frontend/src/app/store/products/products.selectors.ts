import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductsState } from './products.reducer';

export const selectProductsState =
  createFeatureSelector<ProductsState>('products');

export const selectProducts = createSelector(
  selectProductsState,
  (state: ProductsState) => state.products,
);

export const selectMyStoreProducts = createSelector(
  selectProductsState,
  (state: ProductsState) => state.myStoreProducts,
);

export const selectProductsLoading = createSelector(
  selectProductsState,
  (state: ProductsState) => state.loading,
);

export const selectProductsError = createSelector(
  selectProductsState,
  (state: ProductsState) => state.error,
);
