import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MovieWaterfallGrid } from './index';

describe('MovieWaterfallGrid', () => {
  it('keeps content and loading skeletons in the same grid surface', () => {
    render(
      <MovieWaterfallGrid isInitialLoading skeletonCount={2}>
        <span>已加载电影</span>
      </MovieWaterfallGrid>
    );

    expect(screen.getByText('已加载电影')).toBeInTheDocument();
    expect(screen.getAllByLabelText('电影卡片加载中')).toHaveLength(2);
  });

  it('locks the mobile waterfall to two responsive columns', () => {
    const css = readFileSync(
      join(process.cwd(), 'src/entities/movie/ui/movie-waterfall-grid/index.module.less'),
      'utf8'
    );

    expect(css).toContain('@media (max-width: 720px)');
    expect(css).toContain('grid-template-columns: repeat(2, minmax(0, 1fr));');
  });
});
