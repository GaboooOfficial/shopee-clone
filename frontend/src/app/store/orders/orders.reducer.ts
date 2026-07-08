import { createReducer, on } from '@ngrx/store';
import * as OrdersActions from './orders.actions';

export interface OrdersState {
  customerOrders: any[];
  storeOrders: any[];
  courierDeliveries: any[];
  loading: boolean;
  error: string | null;
}

export const initialOrdersState: OrdersState = {
  customerOrders: [],
  storeOrders: [],
  courierDeliveries: [],
  loading: false,
  error: null
};

export const ordersReducer = createReducer(
  initialOrdersState,
  on(OrdersActions.loadCustomerOrders, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(OrdersActions.loadCustomerOrdersSuccess, (state, { orders }) => ({
    ...state,
    customerOrders: orders,
    loading: false,
    error: null
  })),
  on(OrdersActions.loadCustomerOrdersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(OrdersActions.loadStoreOrders, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(OrdersActions.loadStoreOrdersSuccess, (state, { orders }) => ({
    ...state,
    storeOrders: orders,
    loading: false,
    error: null
  })),
  on(OrdersActions.loadStoreOrdersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(OrdersActions.loadCourierDeliveries, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(OrdersActions.loadCourierDeliveriesSuccess, (state, { deliveries }) => ({
    ...state,
    courierDeliveries: deliveries,
    loading: false,
    error: null
  })),
  on(OrdersActions.loadCourierDeliveriesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);
