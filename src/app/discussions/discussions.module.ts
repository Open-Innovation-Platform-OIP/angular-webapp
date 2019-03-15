import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MdModule } from '../md/md.module';
import { MaterialModule } from '../app.module';
import { QuillModule } from "ngx-quill";
import { CommentSubmitComponent } from './submit/submitcomment.component';
import {CommentDisplayComponent} from './display/displaycomment.component';
import { DiscussionsRoutes } from './discussions.routing';

@NgModule({
    imports: [
        CommonModule,
        // RouterModule.forChild(DiscussionsRoutes),
        FormsModule,
        MdModule,
        MaterialModule,
        QuillModule
    ],
    declarations: [CommentSubmitComponent, CommentDisplayComponent],
    exports: [CommentSubmitComponent, CommentDisplayComponent]
})

export class DiscussionsModule {}
