import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

type CharStorage = 's' | 'l';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private whichStorage: CharStorage;
  private itemSources: Map<string, BehaviorSubject<string>> = new Map();
  protected get storage(): Storage {
    const literals = {
      s: sessionStorage,
      l: localStorage,
    };
    return literals[this.whichStorage];
  }

  constructor() {
    addEventListener('storage', (event: StorageEvent) => {
      if (event.key) {
        if (this.itemSources.has(event.key)) {
          this.itemSources.get(event.key).next(event.newValue);
        }
      }
    });
  }

  /**
   * @whichSt parametro que define qual storage será usado , session ou localstorage.
   */
  bootStorageReference(whichSt: CharStorage) {
    this.whichStorage = whichSt;
  }

  get(key: string): Observable<any> {
    if (!this.itemSources.has(key)) {
      this.itemSources.set(
        key,
        new BehaviorSubject<string>(this.storage.getItem(key))
      );
    }

    return this.itemSources
      .get(key)
      .asObservable()
      .pipe(map((data) => JSON.parse(data)));
  }

  store(key: string, value: any) {
    value = JSON.stringify(value);
    try {
      this.storage.setItem(key, value);
      if (this.itemSources.has(key)) {
        this.itemSources.get(key).next(this.storage.getItem(key));
      }
    } catch (error) {
      this.itemSources.get(key).error(error);
    }
  }

  remove(key: string) {
    this.storage.removeItem(key);

    if (this.itemSources.has(key)) {
      this.itemSources.get(key).next(this.storage.getItem(key)); // Expect to be null
      this.itemSources.delete(key);
    }
  }

  clear() {
    this.storage.clear();
    this.itemSources.forEach((itemSource: BehaviorSubject<string>) => {
      itemSource.next(null);
      itemSource.complete();
    });

    this.itemSources.clear();
  }
}
