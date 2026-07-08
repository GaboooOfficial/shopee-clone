import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';
import { AdminComponent } from './admin/admin.component';
import { StoreOwnerComponent } from './store-owner/store-owner.component';
import { CustomerComponent } from './customer/customer.component';
import { MapComponent } from './map/map.component';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { authReducer } from './store/auth/auth.reducer';

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    AdminComponent,
    StoreOwnerComponent,
    CustomerComponent,
    MapComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    StoreModule.forRoot({ auth: authReducer }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
