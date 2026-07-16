import { useEffect, useMemo, useRef, useState } from 'react';

import clsx from 'clsx';
import useEmblaCarousel from 'embla-carousel-react';
import { ExternalLink, Search, Shuffle } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

import { MovieSummary } from '@entities/movie/model/types';
import {
  buildLotteryVisualQueue,
  findVisualIndexByMovieId,
  getNextLotteryIndex,
  getNextSequentialIndex,
  getUniqueLotteryMovies
} from '@features/lottery-banner/lib/lottery-candidates';

import styles from './index.module.less';

type LotterySourceType = 'allFavorites' | 'favorite' | 'homeBanner' | 'homeNowPlaying' | 'nowPlaying';
type LotteryBannerActionMode = 'addToFavorite' | 'removeFromFavorite' | 'readonly';

type LotteryBannerProps = {
  actionMode: LotteryBannerActionMode;
  movies: MovieSummary[];
  sourceType: LotterySourceType;
  variant?: 'compact' | 'hero';
};

function getBannerImage(movie: MovieSummary | undefined) {
  return movie?.backdropUrl ?? movie?.posterUrl ?? '';
}

function getSourceLabel(sourceType: LotterySourceType) {
  if (sourceType === 'homeBanner') {
    return '本周热映';
  }

  if (sourceType === 'allFavorites') {
    return '全部收藏夹';
  }

  if (sourceType === 'favorite') {
    return '当前收藏夹';
  }

  return '正在热映';
}

function getMovieMeta(movie: MovieSummary | undefined) {
  if (!movie) {
    return '先添加电影，再随机挑一部。';
  }

  return `${movie.releaseYear ?? '未知年份'} / ${movie.voteAverage.toFixed(1)}`;
}

export function LotteryBanner({ actionMode, movies, sourceType, variant = 'hero' }: LotteryBannerProps) {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const candidates = useMemo(() => getUniqueLotteryMovies(movies), [movies]);
  const visualQueue = useMemo(
    () => buildLotteryVisualQueue(candidates, variant === 'compact' ? 6 : 8),
    [candidates, variant]
  );
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    containScroll: false,
    loop: visualQueue.length > 1,
    skipSnaps: false
  });
  const isProgrammaticScrollRef = useRef(false);
  const drawingTimerRef = useRef<number[]>([]);
  const [activeMovieId, setActiveMovieId] = useState<number | null>(candidates[0]?.id ?? null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const activeIndex = candidates.findIndex((movie) => movie.id === activeMovieId);
  const activeMovie = activeIndex >= 0 ? candidates[activeIndex] : candidates[0];
  const imageUrl = getBannerImage(activeMovie);
  const isFavoriteLottery = variant === 'compact';
  const sourceLabel = getSourceLabel(sourceType);

  const clearDrawingTimers = () => {
    drawingTimerRef.current.forEach((timer) => window.clearTimeout(timer));
    drawingTimerRef.current = [];
  };

  useEffect(
    () => () => {
      drawingTimerRef.current.forEach((timer) => window.clearTimeout(timer));
      drawingTimerRef.current = [];
    },
    []
  );

  useEffect(() => {
    if (candidates.length === 0) {
      setActiveMovieId(null);
      return;
    }

    if (!activeMovieId || !candidates.some((movie) => movie.id === activeMovieId)) {
      setActiveMovieId(candidates[0].id);
    }
  }, [activeMovieId, candidates]);

  useEffect(() => {
    if (!emblaApi || !activeMovie) {
      return;
    }

    const visualIndex = findVisualIndexByMovieId(visualQueue, activeMovie.id, emblaApi.selectedScrollSnap());

    if (visualIndex >= 0) {
      isProgrammaticScrollRef.current = true;
      emblaApi.scrollTo(visualIndex);
      window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 420);
    }
  }, [activeMovie, emblaApi, visualQueue]);

  useEffect(() => {
    if (!emblaApi) {
      return undefined;
    }

    const syncActiveMovie = () => {
      if (isProgrammaticScrollRef.current) {
        return;
      }

      const selectedItem = visualQueue[emblaApi.selectedScrollSnap()];

      if (selectedItem) {
        setActiveMovieId(selectedItem.movie.id);
      }
    };

    emblaApi.on('select', syncActiveMovie);
    syncActiveMovie();

    return () => {
      emblaApi.off('select', syncActiveMovie);
    };
  }, [emblaApi, visualQueue]);

  useEffect(() => {
    if (candidates.length < 2 || isPaused || isDrawing) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveMovieId((currentMovieId) => {
        const currentIndex = candidates.findIndex((movie) => movie.id === currentMovieId);
        const nextIndex = isFavoriteLottery
          ? getNextLotteryIndex(currentIndex, candidates.length)
          : getNextSequentialIndex(currentIndex, candidates.length);

        return candidates[nextIndex]?.id ?? candidates[0].id;
      });
    }, 5200);

    return () => window.clearInterval(timer);
  }, [candidates, isDrawing, isFavoriteLottery, isPaused]);

  const openMovieDetail = (movie: MovieSummary | undefined) => {
    if (!movie) {
      return;
    }

    navigate(`/movies/${movie.id}`);
  };

  const handleChangeMovie = () => {
    if (candidates.length < 2 || isDrawing) {
      return;
    }

    const currentIndex = activeIndex >= 0 ? activeIndex : 0;
    const nextIndex = getNextLotteryIndex(currentIndex, candidates.length);
    const nextMovieId = candidates[nextIndex]?.id ?? candidates[0].id;

    if (shouldReduceMotion) {
      setActiveMovieId(nextMovieId);
      return;
    }

    clearDrawingTimers();
    setIsDrawing(true);
    setIsPaused(true);

    const spinSteps = Math.max(candidates.length * 2 + 3, 9);
    let elapsed = 0;

    Array.from({ length: spinSteps }).forEach((_, index) => {
      const step = index + 1;
      const delay = 44 + step * 18;
      const movieId = candidates[(currentIndex + step) % candidates.length]?.id ?? nextMovieId;

      elapsed += delay;
      drawingTimerRef.current.push(
        window.setTimeout(() => {
          setActiveMovieId(step === spinSteps ? nextMovieId : movieId);
        }, elapsed)
      );
    });

    drawingTimerRef.current.push(
      window.setTimeout(() => {
        setActiveMovieId(nextMovieId);
        setIsDrawing(false);
        setIsPaused(false);
      }, elapsed + 220)
    );
  };

  const handleSelectMovie = (movie: MovieSummary) => {
    if (isDrawing) {
      return;
    }

    setActiveMovieId(movie.id);
  };

  return (
    <section
      className={clsx(styles.banner, variant === 'compact' && styles.compact, isDrawing && styles.drawing)}
      data-action-mode={actionMode}
      data-source-type={sourceType}
      onBlur={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false}>
        {imageUrl ? (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className={styles.backdrop}
            exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 1.03 }}
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 1.03 }}
            key={imageUrl}
            style={{ backgroundImage: `url(${imageUrl})` }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.58, ease: 'easeOut' }}
          />
        ) : null}
      </AnimatePresence>
      <div className={styles.overlay} />

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className={variant === 'compact' ? styles.resultPanel : styles.heroPanel}
        initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 16 }}
        key={activeMovie?.id ?? 'empty'}
        transition={{ duration: shouldReduceMotion ? 0 : 0.32, ease: 'easeOut' }}
      >
        <span>{sourceLabel}</span>
        <strong>{activeMovie?.title ?? '暂无候选电影'}</strong>
        <p>{variant === 'compact' ? getMovieMeta(activeMovie) : activeMovie?.overview || getMovieMeta(activeMovie)}</p>
        <div className={styles.panelActions}>
          {!activeMovie && isFavoriteLottery ? (
            <button type="button" onClick={() => navigate('/')}>
              <Search size={16} />
              <span>去发现电影</span>
            </button>
          ) : (
            <>
              {isFavoriteLottery ? (
                <button disabled={candidates.length < 2 || isDrawing} type="button" onClick={handleChangeMovie}>
                  <Shuffle size={16} />
                  <span>{isDrawing ? '抽选中' : '换一换'}</span>
                </button>
              ) : null}
              <button disabled={!activeMovie || isDrawing} type="button" onClick={() => openMovieDetail(activeMovie)}>
                <ExternalLink size={16} />
                <span>打开详情</span>
              </button>
            </>
          )}
        </div>
      </motion.div>

      <div className={styles.track}>
        <div className={styles.viewport} ref={emblaRef}>
          <div className={styles.posterRail}>
            {visualQueue.map((item) => (
              <button
                aria-label={`定位到 ${item.movie.title}`}
                className={clsx(styles.poster, item.movie.id === activeMovie?.id && styles.posterActive)}
                disabled={isDrawing}
                key={`${item.movie.id}-${item.visualIndex}`}
                type="button"
                onClick={() => handleSelectMovie(item.movie)}
              >
                <motion.span
                  className={styles.posterInner}
                  whileHover={shouldReduceMotion ? undefined : { y: -6 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                >
                  {item.movie.posterUrl ? (
                    <img alt="" decoding="async" loading="lazy" src={item.movie.posterUrl} />
                  ) : (
                    <span>{item.movie.title}</span>
                  )}
                </motion.span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
