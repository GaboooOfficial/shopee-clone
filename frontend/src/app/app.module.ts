import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { authReducer } from './store/auth/auth.reducer';
import { cartReducer } from './store/cart/cart.reducer';
import { productsReducer } from './store/products/products.reducer';
import { ordersReducer } from './store/orders/orders.reducer';
import { ProductsEffects } from './store/products/products.effects';
import { OrdersEffects } from './store/orders/orders.effects';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    StoreModule.forRoot({
      auth: authReducer,
      cart: cartReducer,
      products: productsReducer,
      orders: ordersReducer
    }),
    EffectsModule.forRoot([ProductsEffects, OrdersEffects]),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: false,
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}


