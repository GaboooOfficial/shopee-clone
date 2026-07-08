import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { AdminComponent } from './admin/admin.component';
import { StoreOwnerComponent } from './store-owner/store-owner.component';
import { CustomerComponent } from './customer/customer.component';
import { CourierComponent } from './courier/courier.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'store-owner',
    component: StoreOwnerComponent,
    canActivate: [AuthGuard],
    data: { roles: ['store_owner'] },
  },
  {
    path: 'customer',
    component: CustomerComponent,
    canActivate: [AuthGuard],
    data: { roles: ['customer'] },
  },
  {
    path: 'courier',
    component: CourierComponent,
    canActivate: [AuthGuard],
    data: { roles: ['courier'] },
  },
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
