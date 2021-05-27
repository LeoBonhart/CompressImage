import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileComponent } from './file.component';
import { FilesizePipe } from './filesize.pipe';
import { DragDirective } from './drag.directive';
import { ClickStopPropagationDirective } from './click-stop-propagation.directive';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [
    DragDirective,
    FileComponent,
    FilesizePipe,
    ClickStopPropagationDirective
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  exports: [
    FileComponent,
    FilesizePipe
  ]
})
export class FileModule { }
