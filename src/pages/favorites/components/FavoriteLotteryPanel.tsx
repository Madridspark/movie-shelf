import { FavoriteLotterySource, FavoriteMovieItem } from '@features/favorites/model/favorites-slice';
import { LotteryBanner } from '@features/lottery-banner/ui/LotteryBanner';
import { DropdownSelect, DropdownSelectOption } from '@shared/ui/dropdown-select';

import styles from '../index.module.less';

type FavoriteLotteryPanelProps = {
  lotteryMovies: FavoriteMovieItem[];
  lotterySource: FavoriteLotterySource;
  sourceOptions: DropdownSelectOption<FavoriteLotterySource>[];
  onLotterySourceChange: (source: FavoriteLotterySource) => void;
};

export function FavoriteLotteryPanel({
  lotteryMovies,
  lotterySource,
  onLotterySourceChange,
  sourceOptions
}: FavoriteLotteryPanelProps) {
  return (
    <div className={styles.lotteryWrap}>
      <div className={styles.lotteryHeader}>
        <span>随机片单</span>
        <DropdownSelect
          ariaLabel="随机片单来源"
          options={sourceOptions}
          value={lotterySource}
          onValueChange={onLotterySourceChange}
        />
      </div>
      <LotteryBanner
        actionMode={lotterySource === 'allFavorites' ? 'readonly' : 'removeFromFavorite'}
        movies={lotteryMovies.map((item) => item.movie)}
        sourceType={lotterySource}
        variant="compact"
      />
    </div>
  );
}
