import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('MovieSearch responsive layout', () => {
  it('keeps two-column mobile content aligned to a fixed gutter', () => {
    const css = readFileSync(join(process.cwd(), 'src/features/movie-search/ui/index.module.less'), 'utf8');

    expect(css).toContain('--mobile-content-gutter: 18px;');
    expect(css).toContain('width: calc(100% - var(--mobile-content-gutter) * 2);');
    expect(css).toContain('> button,');
    expect(css).toContain('> a {');
    expect(css).toContain('flex: 1 1 0;');
  });
});
