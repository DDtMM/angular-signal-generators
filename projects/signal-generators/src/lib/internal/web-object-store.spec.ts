import { WebObjectStore } from "./web-object-store";
import { MapBasedStorage } from "./map-based-storage";

describe('WebObjectStore', () => {
  it('should be able to get and retrieve primitive types', () => {
    const sut = new WebObjectStore(new MapBasedStorage());
    sut.set('key', 45);
    expect(sut.get('key')).toBe(45);
  });

  it('should be able to get and retrieve complex types', () => {
    const expectedValue = { monkey: ['a', 'b', { cat: [1, 2, 3]}], dog: 45 };
    const sut = new WebObjectStore(new MapBasedStorage());
    sut.set('key', expectedValue);
    expect(sut.get('key')).toEqual(expectedValue);
  });

  it('should use reviver when retrieving a value', () => {
    const reviver = (key: string, value: unknown) => (key === 'replaceMe') ? 'replaced' : value;
    const sut = new WebObjectStore(new MapBasedStorage(), undefined, reviver);
    sut.set('key', { leaveMe: 'left', replaceMe: 'never' });
    expect(sut.get('key')).toEqual({ leaveMe: 'left', replaceMe: 'replaced' });
  });

  it('should use replacer when storing a value', () => {
    const replacer = (key: string, value: unknown) => (key === 'replaceMe') ? 'replaced' : value;
    const sut = new WebObjectStore(new MapBasedStorage(), replacer);
    sut.set('key', { leaveMe: 'left', replaceMe: 'never' });
    expect(sut.get('key')).toEqual({ leaveMe: 'left', replaceMe: 'replaced' });
  });

  it('should remove an item when a value is set to undefined', () => {
    const storage = new MapBasedStorage();
    storage.removeItem = jasmine.createSpy('removeItem', storage.removeItem).and.callThrough();
    const sut = new WebObjectStore(storage);
    sut.set('key', undefined);
    expect(storage.removeItem).toHaveBeenCalledOnceWith('key');
  });
});
