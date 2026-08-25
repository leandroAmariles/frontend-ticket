import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TicketsListPageComponent } from './pages/tickets-list-page/tickets-list-page.component';

const routes: Routes = [
  {
    path: '',
    component: TicketsListPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TicketsRoutingModule {}
