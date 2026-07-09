import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import * as ProductsActions from './products.actions';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';

@Injectable()
export class ProductsEffects {
  private baseUrl = 'http://localhost:3000/api';

  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.loadProducts),
      mergeMap((action) => {
        let url = `${this.baseUrl}/products?`;
        if (action.search)
          url += `search=${encodeURIComponent(action.search)}&`;
        if (action.categoryId) url += `categoryId=${action.categoryId}&`;
        if (action.storeId) url += `storeId=${action.storeId}&`;

        return this.http.get<any>(url).pipe(
          map((res) => {
            if (res.success) {
              return ProductsActions.loadProductsSuccess({
                products: res.data,
              });
            } else {
              return ProductsActions.loadProductsFailure({
                error: res.message || 'Failed to load products',
              });
            }
          }),
          catchError((err) =>
            of(
              ProductsActions.loadProductsFailure({
                error: err.error?.message || 'Failed to load products',
              }),
            ),
          ),
        );
      }),
    ),
  );

  loadMyStoreProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.loadMyStoreProducts),
      mergeMap(() => {
        return this.http
          .get<any>(`${this.baseUrl}/products/my-store`, {
            headers: this.authService.getAuthHeaders(),
          })
          .pipe(
            map((res) => {
              if (res.success) {
                return ProductsActions.loadMyStoreProductsSuccess({
                  products: res.data,
                });
              } else {
                return ProductsActions.loadMyStoreProductsFailure({
                  error: res.message || 'Failed to load store products',
                });
              }
            }),
            catchError((err) =>
              of(
                ProductsActions.loadMyStoreProductsFailure({
                  error: err.error?.message || 'Failed to load store products',
                }),
              ),
            ),
          );
      }),
    ),
  );

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private authService: AuthService,
  ) {}
}
