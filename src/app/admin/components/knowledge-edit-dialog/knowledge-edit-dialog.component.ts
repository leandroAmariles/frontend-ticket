import { Component, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { KnowledgeApiService } from '../../services/knowledge-api.service';
import {
  KNOWLEDGE_CATEGORY_LABELS,
  KNOWLEDGE_LIMITS,
  KnowledgeCategoryKey,
  KnowledgeDocument,
} from '../../models/knowledge-document.model';

export interface KnowledgeEditDialogData {
  categoryKey: KnowledgeCategoryKey;
  existing: KnowledgeDocument | null;
}

@Component({
    selector: 'app-knowledge-edit-dialog',
    templateUrl: './knowledge-edit-dialog.component.html',
    styleUrls: ['./knowledge-edit-dialog.component.scss'],
    standalone: false
})
export class KnowledgeEditDialogComponent implements OnDestroy {
  readonly separatorKeysCodes = [ENTER, COMMA];
  readonly limits = KNOWLEDGE_LIMITS;
  readonly categoryLabel = KNOWLEDGE_CATEGORY_LABELS[this.data.categoryKey];

  form: FormGroup;
  examples: string[];
  keywords: string[];
  patterns: string[];

  isSaving = false;
  errorMessage: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private knowledgeApi: KnowledgeApiService,
    private dialogRef: MatDialogRef<KnowledgeEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: KnowledgeEditDialogData
  ) {
    this.examples = [...(data.existing?.examples ?? [])];
    this.keywords = [...(data.existing?.keywords ?? [])];
    this.patterns = [...(data.existing?.patterns ?? [])];

    this.form = this.fb.group({
      description: [
        data.existing?.description ?? '',
        [Validators.required, Validators.maxLength(this.limits.descriptionMaxLength)],
      ],
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addChip(list: string[], maxItems: number, maxLength: number, event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && list.length < maxItems && value.length <= maxLength) {
      list.push(value);
    }
    event.chipInput?.clear();
  }

  removeChip(list: string[], item: string): void {
    const index = list.indexOf(item);
    if (index >= 0) {
      list.splice(index, 1);
    }
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;

    this.knowledgeApi
      .upsert(this.data.categoryKey, {
        description: this.form.value.description,
        examples: this.examples,
        keywords: this.keywords,
        patterns: this.patterns,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.dialogRef.close(true);
        },
        error: (error: any) => {
          this.isSaving = false;
          this.errorMessage = error?.message || 'Error al guardar el documento de conocimiento.';
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  get description() {
    return this.form.get('description');
  }
}
