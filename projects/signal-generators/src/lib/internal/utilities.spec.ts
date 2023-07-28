import { Injector } from '@angular/core';
import { MockedComponentFixture, MockRender } from 'ng-mocks';
import { getDestroyRef, hasKey } from './utilities';

describe('hasKey', () => {
  type Something = { keyX?: number };
  it('returns true if key is in object', () => expect(hasKey({ keyX: 1 }, 'keyX')).toBeTrue());
  it('returns false if key is not in object', () => expect(hasKey<Something>({}, 'keyX')).toBeFalse());
  it('returns false if object is nullish', () => expect(hasKey<Something>(undefined, 'keyX')).toBeFalse());
});

describe('getDestroyRef', () => {
  let fixture: MockedComponentFixture<void, void>;
  let injector: Injector;

  beforeEach(() => {
    fixture = MockRender();
    injector = fixture.componentRef.injector;
  });

  it('throws when no injector is passed and not in injector context', () => {
    expect(() => getDestroyRef(() => 1)).toThrowError();
  });
  it('returns destroyed ref from passed injector', () => {
    const destroyRef = getDestroyRef(() => 1, injector);
    expect(destroyRef).toEqual(destroyRef);
  });
});
