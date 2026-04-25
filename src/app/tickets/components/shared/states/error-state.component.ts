import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-state',
  templateUrl: './error-state.component.html',
  styleUrls: ['./error-state.component.scss'],
})
export class ErrorStateComponent {
  @Input() message: string | null = 'An error occurred while loading tickets.';

  // Reload the page. Templates should call this instead of accessing global `window`.
  reload(): void {
    window.location.reload();
  }
}

