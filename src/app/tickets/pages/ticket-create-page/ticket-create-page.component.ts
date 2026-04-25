import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TicketsApiService } from '../../services/tickets-api.service';
import { TicketsStateService } from '../../services/tickets-state.service';
import { mapCreateFormToApi } from '../../utils/transformers';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Component({
  selector: 'app-ticket-create-page',
  templateUrl: './ticket-create-page.component.html',
  styleUrls: ['./ticket-create-page.component.scss'],
})
export class TicketCreatePageComponent implements OnInit, OnDestroy {
  createForm!: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  priorityOptions = [
    { label: 'Baja', value: 'low' },
    { label: 'Media', value: 'medium' },
    { label: 'Alta', value: 'high' },
  ];

  statusOptions = [
    { label: 'Abierto', value: 'open' },
    { label: 'En progreso', value: 'in_progress' },
    { label: 'Cerrado', value: 'closed' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private apiService: TicketsApiService,
    private ticketsState: TicketsStateService,
    private errorHandler: ErrorHandlerService,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Form is already initialized in constructor
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize the form with validation
   */
  private initializeForm(): void {
    this.createForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(2000)]],
      priority: ['medium', [Validators.required]],
      status: ['open', [Validators.required]],
      assigned_to_id: [null],
      assigned_to_name: [null],
    });
  }

  /**
   * Submit the form and create a new ticket
   */
  onSubmit(): void {
    if (this.createForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    const payload = mapCreateFormToApi(this.createForm.getRawValue());

    this.apiService
      .createTicket(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (createdTicket) => {
          this.successMessage = `Ticket "${createdTicket.title}" created successfully!`;
          this.isSubmitting = false;

          // Re-query to ensure the ticket appears in the list
          this.ticketsState.reQueryForNewTicket(createdTicket.id, () => {
            // Navigate back to tickets list after successful creation
            setTimeout(() => {
              this.router.navigate(['/tickets']);
            }, 1000);
          }).pipe(
            takeUntil(this.destroy$)
          ).subscribe();
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error?.error?.message || 'Failed to create ticket. Please try again.';
          this.errorHandler.handleError(error, 'TicketCreatePage.onSubmit');
        },
      });
  }

  /**
   * Cancel and navigate back
   */
  onCancel(): void {
    this.router.navigate(['/tickets']);
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this.errorMessage = null;
  }

  /**
   * Get form control for template
   */
  get title() {
    return this.createForm.get('title');
  }

  get description() {
    return this.createForm.get('description');
  }

  get priority() {
    return this.createForm.get('priority');
  }

  get status() {
    return this.createForm.get('status');
  }
}

