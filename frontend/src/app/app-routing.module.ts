import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then((m) => m.AdminModule),
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'store-owner',
    loadChildren: () =>
      import('./store-owner/store-owner.module').then((m) => m.StoreOwnerModule),
    canActivate: [AuthGuard],
    data: { roles: ['store_owner'] },
  },
  {
    path: 'customer',
    loadChildren: () =>
      import('./customer/customer.module').then((m) => m.CustomerModule),
    canActivate: [AuthGuard],
    data: { roles: ['customer'] },
  },
  {
    path: 'courier',
    loadChildren: () =>
      import('./courier/courier.module').then((m) => m.CourierModule),
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

