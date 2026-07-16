import { WatchProvider } from '@entities/movie/model/types';

import styles from '../index.module.less';

export type WatchProviderSection = {
  label: string;
  providers: WatchProvider[];
};

type WatchProviderListProps = {
  providerGroups: WatchProviderSection[];
};

export function WatchProviderList({ providerGroups }: WatchProviderListProps) {
  return (
    <div className={styles.panel}>
      <h2>观看平台</h2>
      {providerGroups.length > 0 ? (
        <div className={styles.providerGroups}>
          {providerGroups.map((providerGroup) => (
            <div className={styles.providerGroup} key={providerGroup.label}>
              <h3>{providerGroup.label}</h3>
              <div className={styles.providerList}>
                {providerGroup.providers.slice(0, 6).map((provider) => (
                  <span key={provider.id}>
                    {provider.logoUrl ? <img alt="" decoding="async" loading="lazy" src={provider.logoUrl} /> : null}
                    {provider.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.muted}>当前地区暂无观看平台信息。</p>
      )}
    </div>
  );
}
