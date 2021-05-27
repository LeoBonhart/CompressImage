import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ITypeError } from './drag.directive';

interface IUploadFiles {
  file: File;
  base64: string;
}

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FileComponent,
      multi: true
    }
  ]
})
export class FileComponent implements OnInit {

  onChange?: Function;
  onTouched?: Function;

  fileList: Array<File> = new Array<File>();

  @Input() mime: Array<string> = ['image/jpeg'];

  @Output() files = new EventEmitter<Array<File>>();

  @HostListener('change', ['$event.target.files']) emitFiles( files: FileList ) {
    this.addFiles(files);
    this.onChange && this.onChange(files);
    this.onTouched && this.onTouched(files);
  }

  uploadFiles: Array<IUploadFiles> = new Array<IUploadFiles>();

  constructor(private main: ElementRef<HTMLInputElement>) { }

  ngOnInit(): void {


  }

  onFilesDropped(files: any) {
    this.addFiles(files);
    this.chageFiles();
  }

  addFiles(files: FileList) {
    for (let index = 0; index < files.length; index++) {
      const file: File = files[index];
      this.fileList = this.fileList ?? new Array<File>();
      this.fileList.push(file);
    }
  }

  /**
   * Удаляю файл из списка
   * @param index Индекс файла
   */
  deleteFile(index: number) {
    this.fileList.splice(index, 1);
    this.uploadFiles.splice(index, 1);
    this.chageFiles();
  }

  chageFiles() {
    this.files.emit(this.fileList);
    this.onChange && this.onChange(this.fileList);
    this.onTouched && this.onTouched(this.fileList);
    for (let index = 0; index < this.fileList.length; index++) {
      const file = this.fileList[index];
      this.render(file);
    }
  }

  writeValue( value: null ) {
    this.main.nativeElement.value = '';
    this.fileList = new Array<File>();
  }

  registerOnChange( fn: Function ) {
    this.onChange = fn;
  }

  registerOnTouched( fn: Function ) {
    this.onTouched = fn;
  }

  clear() {
    this.uploadFiles = [];
    this.fileList = [];
    this.chageFiles();
  }

  render(file: File) {
    if (this.uploadFiles.find(x => x.file === file) === undefined) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        this.uploadFiles.push({
          base64: reader.result as string,
          file: file
        });
      }, false);
      reader.readAsDataURL(file);
    }
  }


  onTypeError(error: ITypeError) {
    console.log(error);
  }

  onDeleteImage(index: number) {
    this.deleteFile(index);
  }

}
