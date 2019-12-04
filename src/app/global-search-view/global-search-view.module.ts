import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GlobalSearchViewComponent } from './global-search-view.component';
import { ComponentsModule } from './../components/components.module';
import { FormsModule } from '@angular/forms';
import { GlobalSearchViewRoutes } from './global-search-view.routing';
import { ShareAutofocusModule } from '../share-autofocus/share-autofocus.module';

@NgModule({
  imports: [
    RouterModule.forChild(GlobalSearchViewRoutes),
    CommonModule,
    FormsModule,
    ComponentsModule,
    ShareAutofocusModule
  ],
  declarations: [GlobalSearchViewComponent],
  exports: [GlobalSearchViewComponent]
})
export class GlobalSearchViewModule {}
