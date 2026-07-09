import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourierComponent } from './courier.component';

const routes: Routes = [{ path: '', component: CourierComponent }];

@NgModule({
  declarations: [CourierComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)],
})
export class CourierModule {}
