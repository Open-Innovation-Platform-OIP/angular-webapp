import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MdModule } from "../md/md.module";
import { MaterialModule } from "../app.module";
import { QuillModule } from "ngx-quill";
import { CommentSubmitComponent } from "./submit/submitcomment.component";
import { CommentDisplayComponent } from "./display/displaycomment.component";
import { TimeAgoPipe } from "time-ago-pipe";
import { ComponentsModule } from "../components/components.module";
import { NgxUiLoaderModule } from "ngx-ui-loader";

@NgModule({
  imports: [
    CommonModule,
    // RouterModule.forChild(DiscussionsRoutes),
    FormsModule,
    MdModule,
    MaterialModule,
    QuillModule,
    ComponentsModule,
    NgxUiLoaderModule
  ],
  declarations: [CommentSubmitComponent, CommentDisplayComponent, TimeAgoPipe],
  exports: [CommentSubmitComponent, CommentDisplayComponent]
})
export class DiscussionsModule {}
