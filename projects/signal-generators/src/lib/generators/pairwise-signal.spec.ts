import { Injector, signal } from '@angular/core';
import { pairwiseSignal } from './pairwise-signal';
import { MockedComponentFixture, MockRender } from 'ng-mocks';
import { autoDetectChangesSignal } from '../../testing/signal-testing-utilities';
describe('pairwiseSignal', () => {
  let fixture: MockedComponentFixture<void, void>;
  let injector: Injector;

  beforeEach(() => {
    fixture = MockRender();
    injector = fixture.componentRef.injector;
  });

  it('initially returns undefined when no initialValue is set', () => {
    const source = autoDetectChangesSignal(fixture, 1);
    const pairs = pairwiseSignal(source, { injector });
    expect(pairs()).toEqual(undefined);
  });

  it('initially returns [signalValue, initial] when initialValue is set', () => {
    const source = autoDetectChangesSignal(fixture, 1);
    const pairs = pairwiseSignal(source, { initialValue: 0, injector });
    expect(pairs()).toEqual([0, 1]);
  });

  it('returns the last and second to last item after each emission', () => {
    const source = autoDetectChangesSignal(fixture, 1);
    const pairs = pairwiseSignal(source, { injector });
    expect(pairs()).toEqual(undefined);
    source.set(2);
    expect(pairs()).toEqual([1, 2]);
    source.set(3);
    expect(pairs()).toEqual([2, 3]);
    source.set(5);
    source.set(8);
    expect(pairs()).toEqual([5, 8]);
  });
});
