import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TicketsApiService } from '../../services/tickets-api.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { CreateTicketResponse } from '../../models';
import { mapCreateFormToApi } from '../../utils/transformers';

/**
 * Ticket Create Dialog
 * Opened via MatDialog from the tickets list page. Creates a new ticket via
 * POST /api/tickets. The ticket is processed asynchronously (202 ACCEPTED);
 * initial status is PENDING.
 */
@Component({
  selector: 'app-ticket-create-dialog',
  templateUrl: './ticket-create-dialog.component.html',
  styleUrls: ['./ticket-create-dialog.component.scss'],
})
export class TicketCreateDialogComponent implements OnDestroy {
  createForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private apiService: TicketsApiService,
    private errorHandler: ErrorHandlerService,
    private dialogRef: MatDialogRef<TicketCreateDialogComponent>
  ) {
    this.createForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(250)]],
      descripcion: ['', [Validators.required, Validators.minLength(1)]],
      fecha: [new Date().toISOString().slice(0, 16), [Validators.required]],
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos correctamente';
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
        next: (response: CreateTicketResponse) => {
          this.successMessage = `Ticket enviado correctamente. ID: ${response.messageId}. Será procesado en breve.`;
          this.isSubmitting = false;
          setTimeout(() => {
            this.dialogRef.close(true);
          }, 1200);
        },
        error: (error: any) => {
          this.isSubmitting = false;
          this.errorMessage = error?.message || 'Error al crear el ticket. Inténtalo de nuevo.';
          this.errorHandler.handleError(error, 'TicketCreateDialog.onSubmit');
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  clearError(): void {
    this.errorMessage = null;
  }

  get titulo() { return this.createForm.get('titulo'); }
  get descripcion() { return this.createForm.get('descripcion'); }
  get fecha() { return this.createForm.get('fecha'); }
}
