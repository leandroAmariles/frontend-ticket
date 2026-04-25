import { Component, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-ticket-filters',
  templateUrl: './ticket-filters.component.html',
  styleUrls: ['./ticket-filters.component.scss'],
})
export class TicketFiltersComponent {
  @Output() filtersChange = new EventEmitter<{
    priority?: string;
    status?: string;
  }>();

  filterForm: FormGroup;

  priorityOptions = [
    { label: 'All Priorities', value: '' },
    { label: 'Baja', value: 'low' },
    { label: 'Media', value: 'medium' },
    { label: 'Alta', value: 'high' },
  ];

  statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Abierto', value: 'open' },
    { label: 'En progreso', value: 'in_progress' },
    { label: 'Cerrado', value: 'closed' },
  ];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      priority: [''],
      status: [''],
    });
  }

  /**
   * Handle filter changes
   */
  onFilterChange(): void {
    const filters = {
      priority: this.filterForm.get('priority')?.value || undefined,
      status: this.filterForm.get('status')?.value || undefined,
    };

    // Remove empty filters
    Object.keys(filters).forEach((key) => {
      if (!filters[key as keyof typeof filters]) {
        delete filters[key as keyof typeof filters];
      }
    });

    this.filtersChange.emit(filters);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.filterForm.reset();
    this.onFilterChange();
  }
}

