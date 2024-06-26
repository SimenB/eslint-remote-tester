import { beforeEach } from 'vitest';
import { clearRepositoryCache } from '../utils';

beforeEach(async () => {
    clearRepositoryCache();

    // Timeout between tests - otherwise constant `git clone` calls start failing
    await new Promise(r => setTimeout(r, 2000));
});
