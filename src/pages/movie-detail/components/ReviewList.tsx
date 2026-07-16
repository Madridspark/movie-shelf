import { Review } from '@entities/movie/model/types';

import styles from '../index.module.less';

function formatDate(date: string) {
  if (!date) {
    return '未知日期';
  }

  return new Date(date).toLocaleDateString();
}

type ReviewListProps = {
  expandedReviewIds: string[];
  reviews: Review[];
  onToggleReview: (reviewId: string) => void;
};

export function ReviewList({ expandedReviewIds, onToggleReview, reviews }: ReviewListProps) {
  return (
    <div className={styles.panel}>
      <h2>评论</h2>
      {reviews.length > 0 ? (
        <div className={styles.reviewList}>
          {reviews.map((review) => (
            <article key={review.id}>
              <div className={styles.reviewMeta}>
                <strong>{review.author}</strong>
                <span>
                  {review.rating ? `${review.rating.toFixed(1)} / 10` : '未评分'} · {formatDate(review.createdAt)}
                </span>
              </div>
              <p className={expandedReviewIds.includes(review.id) ? styles.reviewExpanded : undefined}>
                {review.content}
              </p>
              {review.content.length > 180 ? (
                <button type="button" onClick={() => onToggleReview(review.id)}>
                  {expandedReviewIds.includes(review.id) ? '收起' : '展开'}
                </button>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className={styles.muted}>暂无评论。</p>
      )}
    </div>
  );
}
