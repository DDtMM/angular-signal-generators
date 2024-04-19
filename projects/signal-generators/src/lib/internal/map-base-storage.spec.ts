import { MapBasedStorage } from "./map-based-storage";

describe('MapBasedStorage', () => {
  it('should be able to get and retrieve items', () => {
    const sut = new MapBasedStorage();
    sut.setItem('key', 'someValue');
    expect(sut.getItem('key')).toBe('someValue');
  });
  it('#clear should remove all items.', () => {
    const sut = new MapBasedStorage();
    sut.setItem('key1', 'a');
    sut.setItem('key2', 'b');
    sut.setItem('key3', 'c');
    sut.clear();
    expect(sut.length).toBe(0);
  });
  it('#getItem should return null if no item is found', () => {
    const sut = new MapBasedStorage();
    expect(sut.getItem('key')).toBe(null);
  });
  it('#key should return the key at an index.', () => {
    const sut = new MapBasedStorage();
    sut.setItem('key1', 'a');
    sut.setItem('key2', 'b');
    sut.setItem('key3', 'c');
    expect(sut.key(1)).toBe('key2');
  });
  it('#key should return null if the index is out of range.', () => {
    const sut = new MapBasedStorage();
    expect(sut.key(1)).toBe(null);
  });
  it('#removeItem should remove an item.', () => {
    const sut = new MapBasedStorage();
    sut.setItem('key1', 'a');
    sut.setItem('key2', 'b');
    sut.removeItem('key2');
    expect(sut.getItem('key2')).toBe(null);
  });
  it('#length should return the count of items stored.', () => {
    const sut = new MapBasedStorage();
    sut.setItem('key1', 'a');
    sut.setItem('key2', 'b');
    sut.setItem('key3', 'c');
    sut.removeItem('key2');
    expect(sut.length).toBe(2);
  });

});
