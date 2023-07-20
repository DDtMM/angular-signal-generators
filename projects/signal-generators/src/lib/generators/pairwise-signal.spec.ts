import { Injector, signal } from '@angular/core';
import { pairwiseSignal } from './pairwise-signal';
import { MockedComponentFixture, MockRender } from 'ng-mocks';

describe('pairwiseSignal', () => {
  let fixture: MockedComponentFixture<void, void>;
  let injector: Injector;

  beforeEach(() => {
    fixture = MockRender();
    injector = fixture.componentRef.injector;
  });

  it('initially returns undefined when no initialValue is set', () => {
    const source = signal(1);
    const pairs = pairwiseSignal(source);
    expect(pairs()).toEqual(undefined);
  });

  fit('returns the last and second to last item after each emission', () => {
    const source = signal(1);
    const pairs = pairwiseSignal(source);
    // expect(pairs()).toEqual(undefined);
    source.set(5);
    source.set(11);
    console.log('before checking pairs value')
    expect(pairs()).toEqual([1, 5]);
    source.set(14);
    expect(pairs()).toEqual([5, 14]);
  });
});
