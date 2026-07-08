import { createAction, props } from '@ngrx/store';

// Customer Orders
export const loadCustomerOrders = createAction('[Orders] Load Customer Orders');
export const loadCustomerOrdersSuccess = createAction(
  '[Orders] Load Customer Orders Success',
  props<{ orders: any[] }>()
);
export const loadCustomerOrdersFailure = createAction(
  '[Orders] Load Customer Orders Failure',
  props<{ error: string }>()
);

// Store Orders
export const loadStoreOrders = createAction('[Orders] Load Store Orders');
export const loadStoreOrdersSuccess = createAction(
  '[Orders] Load Store Orders Success',
  props<{ orders: any[] }>()
);
export const loadStoreOrdersFailure = createAction(
  '[Orders] Load Store Orders Failure',
  props<{ error: string }>()
);

// Courier Deliveries
export const loadCourierDeliveries = createAction('[Orders] Load Courier Deliveries');
export const loadCourierDeliveriesSuccess = createAction(
  '[Orders] Load Courier Deliveries Success',
  props<{ deliveries: any[] }>()
);
export const loadCourierDeliveriesFailure = createAction(
  '[Orders] Load Courier Deliveries Failure',
  props<{ error: string }>()
);
