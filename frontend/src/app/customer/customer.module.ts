import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomerComponent } from './customer.component';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [{ path: '', component: CustomerComponent }];

@NgModule({
  declarations: [CustomerComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild(routes),
  ],
})
export class CustomerModule {}
