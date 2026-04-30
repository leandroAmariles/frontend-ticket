import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TicketsApiService } from '../../services/tickets-api.service';
import { TicketsStateService } from '../../services/tickets-state.service';
import { mapCreateFormToApi } from '../../utils/transformers';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { Ticket } from '../../models';

/**
 * Ticket Create Page Component
 * NOTE: This component is a stub for the 002-consume-backend-api feature
 * The createTicket API endpoint is out of scope and will be implemented later
 */
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

  statusOptions = [
    { label: 'Pendiente', value: 'PENDING' },
    { label: 'Creado', value: 'CREATED' },
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
      titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      descripcion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(2000)]],
      status: ['PENDING', [Validators.required]],
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
        next: (createdTicket: Ticket) => {
          this.successMessage = `Ticket "${createdTicket.titulo}" created successfully!`;
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
        error: (error: any) => {
          this.isSubmitting = false;
          this.errorMessage = error?.message || 'Failed to create ticket. Please try again.';
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
  get titulo() {
    return this.createForm.get('titulo');
  }

  get descripcion() {
    return this.createForm.get('descripcion');
  }

  get status() {
    return this.createForm.get('status');
  }
}

