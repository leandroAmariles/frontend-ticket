import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { KnowledgeListPageComponent } from './pages/knowledge-list-page/knowledge-list-page.component';

const routes: Routes = [
  {
    path: 'knowledge',
    component: KnowledgeListPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
