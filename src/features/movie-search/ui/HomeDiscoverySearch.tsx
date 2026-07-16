import { Search } from 'lucide-react';

import styles from './index.module.less';

type HomeDiscoverySearchProps = {
  keyword: string;
  onKeywordChange: (keyword: string) => void;
};

export function HomeDiscoverySearch({ keyword, onKeywordChange }: HomeDiscoverySearchProps) {
  return (
    <label className={styles.searchBar}>
      <Search size={22} />
      <input
        aria-label="搜索电影"
        onChange={(event) => onKeywordChange(event.target.value)}
        placeholder="搜索电影、导演、演员"
        type="search"
        value={keyword}
      />
    </label>
  );
}
