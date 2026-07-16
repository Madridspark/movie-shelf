import { MovieSearchResult } from './types';

const imageBaseUrl = 'https://image.tmdb.org/t/p/';

export const HOME_BANNER_INITIAL_MOVIES: MovieSearchResult = {
  items: [
    {
      backdropUrl: `${imageBaseUrl}w1280/s3TBrRGB1iav7gFOCNx3H31MoES.jpg`,
      genreIds: [28, 878, 12],
      originalTitle: 'Inception',
      overview: '一名盗梦专家接受最后一项任务，在目标潜意识中植入一个想法。',
      posterUrl: `${imageBaseUrl}w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg`,
      id: 27205,
      releaseDate: '2010-07-15',
      releaseYear: 2010,
      title: '全面启动',
      voteAverage: 8.4,
      voteCount: 37000
    },
    {
      backdropUrl: `${imageBaseUrl}w1280/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg`,
      genreIds: [12, 18, 878],
      originalTitle: 'Interstellar',
      overview: '一组探险者穿越虫洞，为人类寻找新的生存星球。',
      posterUrl: `${imageBaseUrl}w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg`,
      id: 157336,
      releaseDate: '2014-11-05',
      releaseYear: 2014,
      title: '星际效应',
      voteAverage: 8.5,
      voteCount: 36000
    },
    {
      backdropUrl: `${imageBaseUrl}w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg`,
      genreIds: [878, 12],
      originalTitle: 'Dune: Part Two',
      overview: '保罗联合弗雷曼人踏上复仇之路，同时面对改变宇宙命运的抉择。',
      posterUrl: `${imageBaseUrl}w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg`,
      id: 693134,
      releaseDate: '2024-02-27',
      releaseYear: 2024,
      title: '沙丘：第二部',
      voteAverage: 8.1,
      voteCount: 6500
    },
    {
      backdropUrl: `${imageBaseUrl}w1280/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg`,
      genreIds: [18, 36],
      originalTitle: 'Oppenheimer',
      overview: '理论物理学家奥本海默参与曼哈顿计划，并面对科学、权力与责任的后果。',
      posterUrl: `${imageBaseUrl}w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg`,
      id: 872585,
      releaseDate: '2023-07-19',
      releaseYear: 2023,
      title: '奥本海默',
      voteAverage: 8.1,
      voteCount: 9000
    },
    {
      backdropUrl: `${imageBaseUrl}w1280/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg`,
      genreIds: [18, 28, 80],
      originalTitle: 'The Dark Knight',
      overview: '蝙蝠侠、戈登和哈维丹特联手对抗哥谭最危险的犯罪势力。',
      posterUrl: `${imageBaseUrl}w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg`,
      id: 155,
      releaseDate: '2008-07-16',
      releaseYear: 2008,
      title: '黑暗骑士',
      voteAverage: 8.5,
      voteCount: 33000
    },
    {
      backdropUrl: `${imageBaseUrl}w1280/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg`,
      genreIds: [16, 28, 12],
      originalTitle: 'Spider-Man: Across the Spider-Verse',
      overview: '迈尔斯穿越多重宇宙，与蜘蛛联盟面对新的冲突。',
      posterUrl: `${imageBaseUrl}w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg`,
      id: 569094,
      releaseDate: '2023-05-31',
      releaseYear: 2023,
      title: '蜘蛛人：穿越新宇宙',
      voteAverage: 8.3,
      voteCount: 7500
    }
  ],
  page: 1,
  totalPages: 1,
  totalResults: 6
};

export const HOME_BANNER_PRELOAD_IMAGES = {
  backdrop: HOME_BANNER_INITIAL_MOVIES.items[0].backdropUrl,
  poster: HOME_BANNER_INITIAL_MOVIES.items[0].posterUrl
};
