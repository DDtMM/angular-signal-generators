import { Injector, ResourceRef, effect, untracked } from '@angular/core';

/**
 * Extracts the resolved value type from a {@link ResourceRef}.
 * Used as the return type for {@link resourceRefToPromise}.
 */
type ResourceRefValue<TResource extends ResourceRef<unknown>> =
  TResource extends ResourceRef<infer TValue> ? TValue : never;

/**
 * Resolves a value once a ResourceRef from functions like httpResource or resource are no longer loading.
 * Rejects if the resource error signal becomes truthy.
 * Will resolve immediately if the resource is already loaded, or reject immediately if the resource already has an error.
 *
 * @example
 * ```ts
 * const userResource = httpResource<User>(() => `/api/users/${userId()}`);
 * const user = await resourceRefToPromise(userResource, this.injector);
 * console.log('Loaded user', user);
 * ```
 *
 * @param resource The resource reference to convert into a promise.
 * @param injector Optional injector to use for the internal effect. Only needed if the resource signals depend on injection.
 * @returns A promise that resolves with the resource value once loading completes, or rejects if an error occurs.
 */
export function resourceRefToPromise<TResource extends ResourceRef<unknown>>(
  resource: TResource,
  injector?: Injector
): Promise<ResourceRefValue<TResource>> {

  const initialError = untracked(resource.error);
  if (initialError !== undefined) {
    return Promise.reject(initialError);
  }

  if (!untracked(resource.isLoading)) {
    return Promise.resolve(untracked(resource.value) as ResourceRefValue<TResource>);
  }

  return new Promise<ResourceRefValue<TResource>>((resolve, reject) => {
    const signalEffectRef = effect(() => {
      const error = resource.error();
      if (error !== undefined) {
        signalEffectRef?.destroy();
        reject(error);
        return;
      }

      if (resource.isLoading()) {
        return;
      }

      signalEffectRef?.destroy();
      resolve(untracked(resource.value) as ResourceRefValue<TResource>);
    }, { injector });
  });
}
