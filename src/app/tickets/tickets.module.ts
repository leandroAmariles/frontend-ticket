import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular Material imports
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

// Routing
import { TicketsRoutingModule } from './tickets-routing.module';

// Page components
import { TicketsListPageComponent } from './pages/tickets-list-page/tickets-list-page.component';
import { TicketCreateDialogComponent } from './components/ticket-create-dialog/ticket-create-dialog.component';

// Feature components
import { TicketsTableComponent } from './components/tickets-table/tickets-table.component';
import { TicketFiltersComponent } from './components/ticket-filters/ticket-filters.component';
import { TicketRowComponent } from './components/ticket-row/ticket-row.component';
import { LoadingSkeletonComponent } from './components/shared/states/loading-skeleton.component';
import { EmptyStateComponent } from './components/shared/states/empty-state.component';
import { ErrorStateComponent } from './components/shared/states/error-state.component';
import { TicketStatsCardsComponent } from './components/ticket-stats-cards/ticket-stats-cards.component';

@NgModule({
  declarations: [
    TicketsListPageComponent,
    TicketCreateDialogComponent,
    TicketStatsCardsComponent,
    TicketsTableComponent,
    TicketFiltersComponent,
    TicketRowComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    ErrorStateComponent,
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
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    // Routing
    TicketsRoutingModule,
  ],
})
export class TicketsModule {}

