import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OrdersState } from './orders.reducer';

export const selectOrdersState = createFeatureSelector<OrdersState>('orders');

export const selectCustomerOrders = createSelector(
  selectOrdersState,
  (state: OrdersState) => state.customerOrders
);

export const selectStoreOrders = createSelector(
  selectOrdersState,
  (state: OrdersState) => state.storeOrders
);

export const selectCourierDeliveries = createSelector(
  selectOrdersState,
  (state: OrdersState) => state.courierDeliveries
);

export const selectOrdersLoading = createSelector(
  selectOrdersState,
  (state: OrdersState) => state.loading
);

export const selectOrdersError = createSelector(
  selectOrdersState,
  (state: OrdersState) => state.error
);
