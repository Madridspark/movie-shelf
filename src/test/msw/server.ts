import { setupServer } from 'msw/node';

import { tmdbHandlers } from './handlers';

export const server = setupServer(...tmdbHandlers);
