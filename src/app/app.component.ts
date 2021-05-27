import { Component, ViewChild, ElementRef } from '@angular/core';
import { NgxImageCompressService } from 'ngx-image-compress';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'CompressImage';

  width: number = 500;

  percent: number = 50;

  @ViewChild("imgbefore", { static: false })  imgBefore!: ElementRef<HTMLImageElement>;

  files?: Array<File>;

  imgResultBeforeCompress!: string;

  imgResultAfterCompress!: string;


  constructor(private imageCompress: NgxImageCompressService) {
  }

  compressFile() {
    this.getFiles(file => {
      const name: string = file.name.toLowerCase();
      this.imageCompress.getOrientation(file).then(orientation => {
        this.previewFile(file, image => {
          this.imgResultBeforeCompress = image;
          this.consoleSize(image, 'было');

          setTimeout(() => {
            let ratio = 100;
            const width = this.imgBefore.nativeElement.clientWidth;
            console.log(this.imgBefore);
            if (width > this.width) {
              const percent = (this.width / width) * 100;
              ratio = percent;
            }
            this.imageCompress
              .compressFile(image, orientation, ratio, this.percent)
              .then(result => {
                this.imgResultAfterCompress = result;
                this.consoleSize(result, 'стало');
                fetch(result)
                  .then(res => res.blob())
                  .then(x => this.LocalDownloadFile(x, name));
              });
          }, 0);
        });
      });
    })
  }

  previewFile(file: File, callback: (base64: string) => void) {
    const reader = new FileReader();
    reader.addEventListener('load', function () {
      callback(reader.result as string);
    }, false);
    reader.readAsDataURL(file);
  }

  consoleSize(image: string, txt: string) {
    const byteNow = this.imageCompress.byteCount(image);
    const mbNow = (byteNow / 1024) / 1024;
    console.warn(`Сколько ${txt} байт:`, byteNow);
    console.warn(`Сколько ${txt} мб:`, mbNow);
  }

  /**
   * Скачать файл
   * @param file Данные
   * @param filename Название файла
   * @param type Тип файла
   */
  LocalDownloadFile(file: Blob, filename?: string, type: string = 'image/jpeg') {
    let opt: BlobPropertyBag | undefined;
    if (type) {
      opt = {type: type};
    }
    if (!filename) {
      filename = '';
    }
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(file, filename);
    } else {
      let a = document.createElement('a');
      let url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function() {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
      }, 0);
    }
  }

  hasFiles(): boolean {
    return this.files ? this.files.length > 0 : false;
  }

  getFiles(callback: (file: File) => void): void {
    if (this.files) {
      for (let index = 0; index < this.files.length; index++) {
        callback(this.files[index]);
      }
    }
  }

  clearFiles() {
    this.files = [];
  }

  onFiles(files: Array<File>) {
    this.files = files;
  }

}
