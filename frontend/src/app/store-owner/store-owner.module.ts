import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StoreOwnerComponent } from './store-owner.component';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [{ path: '', component: StoreOwnerComponent }];

@NgModule({
  declarations: [StoreOwnerComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild(routes),
  ],
})
export class StoreOwnerModule {}
