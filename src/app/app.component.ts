import { Component, VERSION } from '@angular/core';
import { StorageService } from './storage';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  name = 'Angular ' + VERSION.major;
  constructor(private storage: StorageService) {}

  ngOnInit() {
    this.storage.bootStorageReference('s');
  }

  teste() {
    this.storage.store('igor', 'local');
    this.storage.get('igor').subscribe((val) => {
      alert(val);
    });

    setTimeout(() => {
      this.storage.bootStorageReference('l');
      this.storage.store('igor', '2');
      this.storage.clear();
    }, 4000);
  }
}
