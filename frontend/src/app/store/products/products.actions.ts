import { createAction, props } from '@ngrx/store';

export const loadProducts = createAction(
  '[Products] Load Products',
  props<{ search?: string; categoryId?: string; storeId?: string }>(),
);

export const loadProductsSuccess = createAction(
  '[Products] Load Products Success',
  props<{ products: any[] }>(),
);

export const loadProductsFailure = createAction(
  '[Products] Load Products Failure',
  props<{ error: string }>(),
);

export const loadMyStoreProducts = createAction(
  '[Products] Load My Store Products',
);

export const loadMyStoreProductsSuccess = createAction(
  '[Products] Load My Store Products Success',
  props<{ products: any[] }>(),
);

export const loadMyStoreProductsFailure = createAction(
  '[Products] Load My Store Products Failure',
  props<{ error: string }>(),
);
