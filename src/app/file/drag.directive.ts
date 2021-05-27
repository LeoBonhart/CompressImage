import { Directive, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';

export interface ITypeError {
  requredTypes: Array<string>;
  errorType: string;
}

@Directive({
  selector: '[appDrag]'
})
export class DragDirective {

  private _typeError?: ITypeError;

  @Output() typeError = new EventEmitter<ITypeError>()

  @Input() mime: Array<string>;

  @Output() filesDropped = new EventEmitter<FileList>();

  @HostBinding('class.fileover') fileOver: boolean = false;

  @HostBinding('class.fileover-error') fileOverError: boolean = false;

  @HostListener('dragover', ['$event']) onDragOver(e: DragEvent) {
    this.stop(e);
    this.fileOver = true;
    if (e.dataTransfer?.files) {
      this.checkFilesType(e.dataTransfer.files);
    }
  }

  @HostListener('dragleave', ['$event']) onDragLeave(e: DragEvent) {
    this.stop(e);
    this.fileOver = false;
    this.fileOverError = false;
  }

  @HostListener('drop', ['$event']) onDrop(e: DragEvent) {
    this.stop(e);
    this.fileOver = false;
    const files = e.dataTransfer?.files;
    this.uploadFiles(files);
  }

  @HostListener('click', ['$event']) onClick(e: Event) {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.click();
    input.addEventListener('change', (e) => {
      if (input.files) {
        this.checkFilesType(input.files);
      }
      this.uploadFiles(input.files);
      input.remove()
    });
  }

  constructor() { }

  stop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  checkFilesType(files: FileList) {
    if (files && this.mime) {
      this._typeError = {requredTypes: this.mime, errorType: ''};
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        if (this._typeError?.errorType === '' && this.mime.indexOf(file.type) === -1) {
          this._typeError.errorType = file.type;
        }
      }
    }
  }

  uploadFiles(files: FileList | undefined | null) {
    if (this._typeError?.errorType !== '') {
      this.typeError.emit(this._typeError);
      return;
    }
    if (files && files.length > 0) {
      this.filesDropped.emit(files);
    }
  }

}
