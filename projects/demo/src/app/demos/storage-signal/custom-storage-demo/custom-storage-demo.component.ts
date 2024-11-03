import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { StorageSignalStore, storageSignal } from '@ddtmm/angular-signal-generators';
import { Subject, scan } from 'rxjs';

@Component({
    selector: 'app-custom-storage-demo',
    imports: [FormsModule],
    templateUrl: './custom-storage-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomStorageDemoComponent {
  private readonly storageProvider = new StorageSpy();
  readonly $eventLog = toSignal(this.storageProvider.events$.pipe(scan((acc, cur) => [...acc, cur], [] as string[])));
  readonly $stored = storageSignal('Change Me', 'demos-custom-storage-greeting', this.storageProvider);
}

class StorageSpy implements StorageSignalStore<string> {
  readonly events$ = new Subject<string>();
  readonly storage: Storage | undefined = globalThis.sessionStorage;
  get(key: string): string | undefined {
    this.events$.next(`Retrieved ${key}.`);
    return this.storage?.getItem(key) ?? undefined;
  }
  set(key: string, value: string): void {
    this.events$.next(`Stored ${key} with the value "${value}".`);
    this.storage?.setItem(key, value);
  }
}
