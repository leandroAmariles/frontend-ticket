import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TicketsListPageComponent } from './pages/tickets-list-page/tickets-list-page.component';
import { TicketCreatePageComponent } from './pages/ticket-create-page/ticket-create-page.component';

const routes: Routes = [
  {
    path: '',
    component: TicketsListPageComponent,
  },
  {
    path: 'new',
    component: TicketCreatePageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TicketsRoutingModule {}

