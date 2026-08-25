import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { KnowledgeApiService } from '../../services/knowledge-api.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { KnowledgeEditDialogComponent } from '../../components/knowledge-edit-dialog/knowledge-edit-dialog.component';
import {
  KNOWLEDGE_CATEGORY_KEYS,
  KNOWLEDGE_CATEGORY_LABELS,
  KnowledgeCategoryKey,
  KnowledgeDocument,
} from '../../models/knowledge-document.model';

interface CategorySlot {
  categoryKey: KnowledgeCategoryKey;
  label: string;
  document: KnowledgeDocument | null;
}

@Component({
  selector: 'app-knowledge-list-page',
  templateUrl: './knowledge-list-page.component.html',
  styleUrls: ['./knowledge-list-page.component.scss'],
})
export class KnowledgeListPageComponent implements OnInit {
  slots: CategorySlot[] = [];
  loading = false;
  errorMessage: string | null = null;

  constructor(private knowledgeApi: KnowledgeApiService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = null;

    this.knowledgeApi.getAll().subscribe({
      next: (documents) => {
        const byKey = new Map(documents.map((doc) => [doc.categoryKey.toLowerCase(), doc]));
        this.slots = KNOWLEDGE_CATEGORY_KEYS.map((key) => ({
          categoryKey: key,
          label: KNOWLEDGE_CATEGORY_LABELS[key],
          document: byKey.get(key) ?? null,
        }));
        this.loading = false;
      },
      error: (error: any) => {
        this.errorMessage = error?.message || 'Error al cargar la base de conocimiento.';
        this.loading = false;
      },
    });
  }

  edit(slot: CategorySlot): void {
    const dialogRef = this.dialog.open(KnowledgeEditDialogComponent, {
      width: '600px',
      data: { categoryKey: slot.categoryKey, existing: slot.document },
    });

    dialogRef.afterClosed().subscribe((saved: boolean) => {
      if (saved) {
        this.load();
      }
    });
  }

  remove(slot: CategorySlot): void {
    if (!slot.document) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Eliminar documento de conocimiento',
        message: `¿Seguro que quieres eliminar el documento de "${slot.label}"? Esto también elimina sus embeddings.`,
        confirmText: 'Eliminar',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.knowledgeApi.delete(slot.categoryKey).subscribe({
          next: () => this.load(),
          error: (error: any) => {
            this.errorMessage = error?.message || 'Error al eliminar el documento.';
          },
        });
      }
    });
  }
}
