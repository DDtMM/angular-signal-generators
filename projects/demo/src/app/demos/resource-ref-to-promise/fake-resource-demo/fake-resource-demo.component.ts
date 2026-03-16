import { ChangeDetectionStrategy, Component, Injector, ResourceRef, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { resourceRefToPromise } from '@ddtmm/angular-signal-generators';

type FakeResourceRef<TValue> = Pick<ResourceRef<TValue>, 'error' | 'isLoading' | 'value'>;

@Component({
    selector: 'app-fake-resource-demo',
    imports: [FormsModule],
    templateUrl: './fake-resource-demo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FakeResourceDemoComponent {
  private readonly injector = inject(Injector);

  readonly $delayMs = signal(1200);
  readonly $lastError = signal<string | undefined>(undefined);
  readonly $lastResult = signal<string>('No result yet');
  readonly $activeResource = signal<FakeResourceRef<string> | undefined>(undefined);
  readonly $status = signal<'idle' | 'pending' | 'resolved' | 'rejected'>('idle');

  constructor() {
    effect(() => {
      const activeResource = this.$activeResource();
      if (!activeResource) {
        return;
      }
      activeResource.isLoading();
      activeResource.error();
      activeResource.value();
    });
  }

  runSuccessDemo(): void {
    const fakeResource = this.createDelayedFakeResource(
      () => `Loaded fake profile at ${new Date().toLocaleTimeString()}`,
      this.$delayMs(),
      false
    );
    this.awaitResource(fakeResource);
  }

  runErrorDemo(): void {
    const fakeResource = this.createDelayedFakeResource(
      () => 'Not used',
      this.$delayMs(),
      true
    );
    this.awaitResource(fakeResource);
  }

  private async awaitResource(fakeResource: FakeResourceRef<string>): Promise<void> {
    this.$activeResource.set(fakeResource);
    this.$status.set('pending');
    this.$lastError.set(undefined);
    this.$lastResult.set('Waiting for fake resource...');

    try {
      const value = await resourceRefToPromise(fakeResource as ResourceRef<string>, this.injector);
      this.$status.set('resolved');
      this.$lastResult.set(value);
    } catch (error: unknown)  { 
      this.$status.set('rejected');
      this.$lastError.set(error instanceof Error ? error.message : String(error));
    }
  }

  private createDelayedFakeResource(
    valueFactory: () => string,
    delayMs: number,
    shouldFail: boolean
  ): FakeResourceRef<string> {
    const $error = signal<Error | undefined>(undefined);
    const $isLoading = signal(true);
    const $value = signal<string>('');

    setTimeout(() => {
      if (shouldFail) {
        $error.set(new Error('Fake request failed.'));
      } else {
        $value.set(valueFactory());
      }
      $isLoading.set(false);
    }, delayMs);

    return {
      error: $error,
      isLoading: $isLoading,
      value: $value
    };
  }
}
