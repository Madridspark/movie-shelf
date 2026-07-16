import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

import { MovieSearchSortMode } from '@features/preferences/model/preferences-slice';
import { DropdownSelect, DropdownSelectOption } from '@shared/ui/dropdown-select';

import { HomeDiscoverySearch } from './HomeDiscoverySearch';
import styles from './index.module.less';

type HomeToolbarProps = {
  keyword: string;
  sortMode: MovieSearchSortMode;
  sortOptions: DropdownSelectOption<MovieSearchSortMode>[];
  onKeywordChange: (keyword: string) => void;
  onSortModeChange: (sortMode: MovieSearchSortMode) => void;
};

export function HomeToolbar({
  keyword,
  onKeywordChange,
  onSortModeChange,
  sortMode,
  sortOptions
}: HomeToolbarProps) {
  return (
    <div className={styles.searchToolbar}>
      <HomeDiscoverySearch keyword={keyword} onKeywordChange={onKeywordChange} />

      <div className={styles.toolbarActions}>
        <DropdownSelect
          ariaLabel="搜索结果排序"
          options={sortOptions}
          value={sortMode}
          onValueChange={onSortModeChange}
        />
        <Link to="/favorites">
          <Heart size={18} />
          收藏夹
        </Link>
      </div>
    </div>
  );
}
