import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { HighlightModule } from 'ngx-highlightjs';
import { asyncSignal } from 'projects/signal-generators/src/public-api';
import { Observable, map, of, startWith, timer } from 'rxjs';
import { SignalHeaderComponent } from '../controls/signal-header.component';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-async-signal-demo',
  standalone: true,
  imports: [CommonModule, FaIconComponent, HighlightModule, SignalHeaderComponent],
  template: `
    <app-signal-header fnName="asyncSignal" />
    <p>
      "Flattens" a source of promises or observables to a signal of result values, switching to the new source as soon as it
      changes.
    </p>
    <p>
      To avoid confusion an observable of observables is not "flattened." This is so observables passed in as the valueSource can
      create a writable signal. The function <code class="inline p-1">toSignal</code> can be used if this behavior is necessary.
    </p>
    <h3>Demo</h3>
    <div class="overflow-x-auto">
      <div class="grid grid-flow-col grid-cols-2 gap-3">
        <div>
          <h4>Customers <span class="text-info">(click to simulate load)</span></h4>
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              @for (c of customers; track c.id) {
              <tr class="hover" (click)="$id.set(c.id)">
                <td>{{ c.id }}</td>
                <td>{{ c.name }}</td>
              </tr>
              }
            </tbody>
          </table>
          </div>
        <div>
          <h4>Products</h4>
          @if ($id() === 0) {
            <span class="text-info">Select Customer to see Products</span>
          }
          @if ($products().state === 'loading') {
            <span>Loading <fa-icon [icon]="faSpinner" class="text-info" animation="spin" /></span>
          }
          @else if ($products().value.length) {
            <table class="table">
              <thead>
                <tr>
                  <th>Product Name</th>
                </tr>
              </thead>
              <tbody>
                @for (p of $products().value; track p) {
                  <tr>
                    <td>{{ p }}</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>
      <div>
        <h3>Example</h3>
        <pre><code [highlight]="example" [languages]="['typescript']"></code></pre>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AsyncSignalDemoComponent {
  readonly customers = [
    { id: 1, name: 'Danny Gimenez ' },
    { id: 2, name: 'Joe Jinglebarray' },
    { id: 3, name: 'Terry Terry' },
    { id: 4, name: 'Soupie Sales' }
  ];
  readonly example = `
readonly $id = signal(0);
// assume getProducts is a method that calls an http endpoint and returns a state.
readonly $products = asyncSignal(() => $id() !== 0 ? this.getProducts(this.$id()) : of([]));
`.trim();
  readonly faSpinner = faSpinner;
  readonly $id = signal(0);
  readonly $products = asyncSignal(() => this.getProducts(this.$id()), { defaultValue: { state: 'loading', value: [] } });

  /** Simulates a http call. */
  getProducts(id: number): Observable<{ state: 'loading' | 'ready'; value: string[] }> {
    const sampleProducts = [
      'car',
      'dog',
      'bunny',
      'sports car',
      'video game',
      'rad skate board',
      'scary terry doll',
      'globe'
    ];
    if (id === 0) {
      return of({ state: 'ready', value: [] });
    }
    return timer(2000).pipe(
      map(() => ({ state: 'ready' as const, value: sampleProducts.filter((_, i) => (i + id) % 4 === 0) })),
      startWith({ state: 'loading' as const, value: [] })
    );
  }
}
