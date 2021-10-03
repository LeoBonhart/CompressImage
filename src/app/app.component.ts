import { Component, ViewChild, ElementRef, OnInit, AfterViewInit, Renderer2 } from '@angular/core';
import { NgxImageCompressService } from 'ngx-image-compress';
import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit{
  title = 'CompressImage';

  width: number = 500;

  percent: number = 50;

  @ViewChild("imgbeforecontainer", { static: false })  imgbeforecontainer!: ElementRef<HTMLDivElement>;

  files?: Array<File>;

  constructor(private imageCompress: NgxImageCompressService, private r2: Renderer2) {
  }
  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
  }

  compressFile() {
    this.getFiles(file => {
      const name: string = file.name.toLowerCase();
      this.imageCompress.getOrientation(file).then(orientation => {
        this.previewFile(file).then(image => {
          // this.consoleSize(result, 'было');
          const img = this.r2.createElement('img' as keyof HTMLElementTagNameMap) as HTMLImageElement;
          this.r2.appendChild(this.imgbeforecontainer.nativeElement, img);
          this.r2.listen(img, 'load' as keyof DocumentEventMap, (e: Event) => {
            let ratio = 100;
            const width = img.width;
            if (width > this.width) {
              const percent = (this.width / width) * 100;
              ratio = percent;
            }
            this.imageCompress
              .compressFile(image, orientation, ratio, this.percent)
              .then(result => {
                // this.consoleSize(result, 'стало');
                fetch(result)
                  .then(res => res.blob())
                  .then(x => {
                    this.LocalDownloadFile(x, name);
                    img.remove();
                  });
              });
          });
          this.r2.setAttribute(img, 'src', image);
        });
      });
    })
  }

  previewFile(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', function () {
        resolve(reader.result as string);
      }, false);
      reader.readAsDataURL(file);
    });
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
      const a = this.r2.createElement('a' as keyof HTMLElementTagNameMap) as HTMLAnchorElement ;
      let url = URL.createObjectURL(file);
      this.r2.setAttribute(a, 'href', url);
      this.r2.setAttribute(a, 'download', filename);
      this.r2.appendChild(this.imgbeforecontainer.nativeElement, a);
      a.click();
      setTimeout(function() {
        a.remove();
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
