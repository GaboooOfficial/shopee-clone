import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import * as OrdersActions from './orders.actions';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';

@Injectable()
export class OrdersEffects {
  private baseUrl = 'http://localhost:3000/api';

  loadCustomerOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrdersActions.loadCustomerOrders),
      mergeMap(() =>
        this.http
          .get<any>(`${this.baseUrl}/orders/my-orders`, {
            headers: this.authService.getAuthHeaders(),
          })
          .pipe(
            map((res) => {
              if (res.success) {
                return OrdersActions.loadCustomerOrdersSuccess({
                  orders: res.data,
                });
              } else {
                return OrdersActions.loadCustomerOrdersFailure({
                  error: res.message || 'Failed to load customer orders',
                });
              }
            }),
            catchError((err) =>
              of(
                OrdersActions.loadCustomerOrdersFailure({
                  error: err.error?.message || 'Failed to load customer orders',
                }),
              ),
            ),
          ),
      ),
    ),
  );

  loadStoreOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrdersActions.loadStoreOrders),
      mergeMap(() =>
        this.http
          .get<any>(`${this.baseUrl}/orders/store-orders`, {
            headers: this.authService.getAuthHeaders(),
          })
          .pipe(
            map((res) => {
              if (res.success) {
                return OrdersActions.loadStoreOrdersSuccess({
                  orders: res.data,
                });
              } else {
                return OrdersActions.loadStoreOrdersFailure({
                  error: res.message || 'Failed to load store orders',
                });
              }
            }),
            catchError((err) =>
              of(
                OrdersActions.loadStoreOrdersFailure({
                  error: err.error?.message || 'Failed to load store orders',
                }),
              ),
            ),
          ),
      ),
    ),
  );

  loadCourierDeliveries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrdersActions.loadCourierDeliveries),
      mergeMap(() =>
        this.http
          .get<any>(`${this.baseUrl}/orders/courier/pending`, {
            headers: this.authService.getAuthHeaders(),
          })
          .pipe(
            map((res) => {
              if (res.success) {
                return OrdersActions.loadCourierDeliveriesSuccess({
                  deliveries: res.data,
                });
              } else {
                return OrdersActions.loadCourierDeliveriesFailure({
                  error: res.message || 'Failed to load deliveries',
                });
              }
            }),
            catchError((err) =>
              of(
                OrdersActions.loadCourierDeliveriesFailure({
                  error: err.error?.message || 'Failed to load deliveries',
                }),
              ),
            ),
          ),
      ),
    ),
  );

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private authService: AuthService,
  ) {}
}
