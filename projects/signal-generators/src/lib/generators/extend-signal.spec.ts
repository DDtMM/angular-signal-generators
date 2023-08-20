import { computed, signal } from '@angular/core';
import { extendSignal } from './extend-signal';
import { setupGeneralSignalTests } from './general-signal-tests.spec';

describe('extendSignal', () => {
  setupGeneralSignalTests(() => extendSignal(1, { dummy: () => undefined}));

  it('initially returns initial value from a value', () => {
    const source = extendSignal(1, { dummy: () => undefined});
    expect(source()).toEqual(1);
  });
  it('initially returns initial value from a signal', () => {
    const source = extendSignal(signal(1), { dummy: () => undefined});
    expect(source()).toEqual(1);
  });
  it('can add multiple methods', () => {
    const source = extendSignal(signal(1), {
      method1: (proxy, num1: number, num2: number) => proxy.update(val => val + num1 + num2),
      method2: (proxy, text: string) => `${text} ${proxy()}`
    });
    source.method1(2, 3);
    expect(source()).toEqual(6);
    expect(source.method2('The value is')).toEqual('The value is 6');
  });
  it('can extend a computed signal', () => {
    const source = extendSignal(computed(() => 5), {
      label: (proxy, text: string) => `${text} ${proxy()}`
    });
    expect(source.label('The value is')).toEqual('The value is 5');
  });
  describe('can overwrite signal methods', () => {
    it('should safely change the signature of set', () => {
      const source = extendSignal({ value: 2 }, { mutate: (proxy, value: string) => proxy.mutate(x => x.value += value.length)});
      source.mutate('four');
      expect(source()).toEqual({ value: 6 });
    })
    it('should safely change the signature of set', () => {
      const source = extendSignal(2, { set: (proxy, value: string) => proxy.set(value.length)});
      source.set('four');
      expect(source()).toEqual(4);
    });
    it('should safely change the signature of update', () => {
      const source = extendSignal(2, { update: (proxy, value: string) => proxy.update(x => value.length + x)});
      source.update('four');
      expect(source()).toEqual(6);
    });
  });
  it('should get the current value when proxy.get is used by extended function', () => {
    const source = extendSignal({ value: 2 }, { getMe: (proxy) => proxy().value + 4 });
    const result = source.getMe();
    expect(result).toEqual(6);
  });
  it('should set when proxy.set is used by extended function', () => {
    const source = extendSignal({ value: 2 }, { setMe: (proxy) => proxy.set({ value: 6 })});
    source.setMe();
    expect(source()).toEqual({ value: 6 });
  });
  it('should update when proxy.update is used by extended function', () => {
    const source = extendSignal({ value: 2 }, { updateMe: (proxy) => proxy.update(x => ({ value: x.value + 4 }))});
    source.updateMe();
    expect(source()).toEqual({ value: 6 });
  });
  it('should mutate when proxy.mutate is used by extended function', () => {
    const source = extendSignal({ value: 2 }, { mutateMe: (proxy) => proxy.mutate(x => x.value += 4 ) });
    source.mutateMe();
    expect(source()).toEqual({ value: 6 });
  });
});
