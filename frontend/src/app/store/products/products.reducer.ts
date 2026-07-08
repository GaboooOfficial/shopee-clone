import { createReducer, on } from '@ngrx/store';
import * as ProductsActions from './products.actions';

export interface ProductsState {
  products: any[];
  myStoreProducts: any[];
  loading: boolean;
  error: string | null;
}

export const initialProductsState: ProductsState = {
  products: [],
  myStoreProducts: [],
  loading: false,
  error: null
};

export const productsReducer = createReducer(
  initialProductsState,
  on(ProductsActions.loadProducts, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ProductsActions.loadProductsSuccess, (state, { products }) => ({
    ...state,
    products,
    loading: false,
    error: null
  })),
  on(ProductsActions.loadProductsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(ProductsActions.loadMyStoreProducts, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ProductsActions.loadMyStoreProductsSuccess, (state, { products }) => ({
    ...state,
    myStoreProducts: products,
    loading: false,
    error: null
  })),
  on(ProductsActions.loadMyStoreProductsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);
