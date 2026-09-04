// Use the newer Vitest adapter with Angular 20's supported Zone runtime.
import 'zone-vitest/plugins/vitest-patch';

afterEach(() => vi.restoreAllMocks());
