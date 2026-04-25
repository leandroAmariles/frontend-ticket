import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular Material imports (will be completed in T002)
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Routing
import { TicketsRoutingModule } from './tickets-routing.module';

// Page components
import { TicketsListPageComponent } from './pages/tickets-list-page/tickets-list-page.component';
import { TicketCreatePageComponent } from './pages/ticket-create-page/ticket-create-page.component';

// Feature components
import { TicketsTableComponent } from './components/tickets-table/tickets-table.component';
import { TicketFiltersComponent } from './components/ticket-filters/ticket-filters.component';
import { TicketRowComponent } from './components/ticket-row/ticket-row.component';

@NgModule({
  declarations: [
    TicketsListPageComponent,
    TicketCreatePageComponent,
    TicketsTableComponent,
    TicketFiltersComponent,
    TicketRowComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    // Angular Material
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    // Routing
    TicketsRoutingModule,
  ],
})
export class TicketsModule {}

