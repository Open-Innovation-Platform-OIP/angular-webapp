import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// import { GlobalSearchViewComponent } from "./global-search-view.component";
import { ComponentsModule } from '../components/components.module';
import { FormsModule } from '@angular/forms';
import { EnrichmentFormRoutes } from './enrichment-form.routing';
import { EnrichmentFormComponent } from '../enrichment-form/enrichment-form.component';

@NgModule({
  imports: [
    RouterModule.forChild(EnrichmentFormRoutes),
    CommonModule,
    FormsModule,
    ComponentsModule
  ],
  declarations: [EnrichmentFormComponent],
  exports: [EnrichmentFormComponent]
})
export class EnrichmentFormModule {}
