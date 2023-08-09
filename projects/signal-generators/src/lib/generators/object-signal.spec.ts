import { Injector } from '@angular/core';
import { MockRender, MockedComponentFixture } from 'ng-mocks';
import { autoDetectChangesSignal } from '../../testing/signal-testing-utilities';
import { objectSignal } from './object-signal';

describe('objectSignal', () => {
  let fixture: MockedComponentFixture<void, void>;
  let injector: Injector;

  beforeEach(() => {
    fixture = MockRender();
    injector = fixture.componentRef.injector;
  });

  it('initially returns the initial value', () => {
    const obj = objectSignal([1, 2, 3], []);
    expect(obj()).toEqual([1, 2, 3]);
  });
});
