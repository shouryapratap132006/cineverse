export interface Movie {
  id: string;
  title: string;
  overview: string;
  rating: number;
  releaseYear: number;
  releaseDate: string;
  backdropUrl: string;
  posterUrl: string;
  genres: string[];
  runtime: number;
  cast: { name: string; character: string; avatarUrl: string }[];
  crew: { name: string; job: string }[];
  reviews: { id: string; user: string; rating: number; content: string; date: string; avatarUrl: string }[];
  trailerUrl: string; // YouTube ID
  streamingPlatforms: string[];
  production: string[];
}

export interface CommunityPost {
  id: string;
  user: string;
  userAvatar: string;
  userTitle: string;
  content: string;
  movieTag?: string;
  likes: number;
  commentsCount: number;
  timeAgo: string;
}

export interface MovieClub {
  id: string;
  name: string;
  description: string;
  members: number;
  currentMovie: string;
  coverUrl: string;
}

export const MOCK_MOVIES: Movie[] = [
  {
    id: "1",
    title: "Interstellar",
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    rating: 8.7,
    releaseYear: 2014,
    releaseDate: "November 7, 2014",
    backdropUrl: "/api/tmdb/img?path=/t/p/w1280/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    posterUrl: "/api/tmdb/img?path=/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    genres: ["Sci-Fi", "Drama", "Adventure"],
    runtime: 169,
    cast: [
      { name: "Matthew McConaughey", character: "Cooper", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" },
      { name: "Anne Hathaway", character: "Brand", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
      { name: "Jessica Chastain", character: "Murph", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100" }
    ],
    crew: [
      { name: "Christopher Nolan", job: "Director" },
      { name: "Jonathan Nolan", job: "Writer" },
      { name: "Hans Zimmer", job: "Original Music Composer" }
    ],
    reviews: [
      { id: "r1", user: "NolanGeek", rating: 10, content: "An absolute masterpiece. Zimmer's organ soundtrack combined with McConaughey's performance makes it a timeless classic. The emotional weight of the father-daughter relationship hits hard.", date: "2 days ago", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
      { id: "r2", user: "CineCritic", rating: 8, content: "Visually stunning and scientifically ambitious. Some plot holes near the end, but the overall voyage is thrilling and breathtaking.", date: "1 week ago", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" }
    ],
    trailerUrl: "zSWdZVtXT7E",
    streamingPlatforms: ["Netflix", "Paramount+", "Prime Video"],
    production: ["Warner Bros. Pictures", "Legendary Pictures", "Syncopy"]
  },
  {
    id: "2",
    title: "Dune: Part Two",
    overview: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.",
    rating: 8.9,
    releaseYear: 2024,
    releaseDate: "March 1, 2024",
    backdropUrl: "/api/tmdb/img?path=/t/p/w1280/oeB0h2MxK9GRuIA0nI7she6RivA.jpg",
    posterUrl: "/api/tmdb/img?path=/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    genres: ["Sci-Fi", "Adventure", "Action"],
    runtime: 166,
    cast: [
      { name: "Timothée Chalamet", character: "Paul Atreides", avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100" },
      { name: "Zendaya", character: "Chani", avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100" },
      { name: "Rebecca Ferguson", character: "Lady Jessica", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" }
    ],
    crew: [
      { name: "Denis Villeneuve", job: "Director" },
      { name: "Frank Herbert", job: "Novel Writer" },
      { name: "Hans Zimmer", job: "Original Music Composer" }
    ],
    reviews: [
      { id: "r3", user: "DesertWalker", rating: 9, content: "Villeneuve has done the impossible. The scale, the sound, the cinematography—everything makes you feel the sand on your skin. A landmark in sci-fi cinema history.", date: "4 days ago", avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100" }
    ],
    trailerUrl: "Way9DexNy3w",
    streamingPlatforms: ["Max", "Prime Video"],
    production: ["Legendary Pictures", "Warner Bros. Pictures"]
  },
  {
    id: "3",
    title: "Parasite",
    overview: "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",
    rating: 8.6,
    releaseYear: 2019,
    releaseDate: "May 30, 2019",
    backdropUrl: "/api/tmdb/img?path=/t/p/w1280/ApiBzeaa95TNYLSKkEWbW5CbZfB.jpg",
    posterUrl: "/api/tmdb/img?path=/t/p/w500/7IiTTgloROVKhBd7NsJuFiqE8oA.jpg",
    genres: ["Thriller", "Drama", "International"],
    runtime: 132,
    cast: [
      { name: "Song Kang-ho", character: "Ki-taek", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
      { name: "Lee Sun-kyun", character: "Mr. Park", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" },
      { name: "Cho Yeo-jeong", character: "Mrs. Park", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" }
    ],
    crew: [
      { name: "Bong Joon Ho", job: "Director" },
      { name: "Han Jin-won", job: "Writer" }
    ],
    reviews: [
      { id: "r4", user: "K-CinemaLover", rating: 10, content: "Unbelievably sharp social commentary. It shifts from comedy to thriller to tragedy effortlessly. Fully deserved its historic Best Picture Oscar.", date: "3 weeks ago", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100" }
    ],
    trailerUrl: "5xH0HfJHsaY",
    streamingPlatforms: ["Max", "Hulu"],
    production: ["Barunson E&A", "CJ Entertainment"]
  },
  {
    id: "4",
    title: "Spirited Away",
    overview: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
    rating: 8.6,
    releaseYear: 2001,
    releaseDate: "July 20, 2001",
    backdropUrl: "/api/tmdb/img?path=/t/p/w1280/bSavbTHyPmKAlHIUFqSFaeTa9VG.jpg",
    posterUrl: "/api/tmdb/img?path=/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    genres: ["Anime", "Fantasy", "Family"],
    runtime: 125,
    cast: [
      { name: "Rumi Hiiragi", character: "Chihiro (voice)", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100" },
      { name: "Miyu Irino", character: "Haku (voice)", avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100" }
    ],
    crew: [
      { name: "Hayao Miyazaki", job: "Director" },
      { name: "Joe Hisaishi", job: "Original Music Composer" }
    ],
    reviews: [
      { id: "r5", user: "AnimeGuru", rating: 10, content: "Miyazaki's crowning achievement. A magical, beautifully animated allegory about growing up that speaks to children and adults alike.", date: "1 month ago", avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100" }
    ],
    trailerUrl: "ByXuk9QqQkk",
    streamingPlatforms: ["Max", "Netflix"],
    production: ["Studio Ghibli", "Tokuma Shoten"]
  },
  {
    id: "5",
    title: "The Dark Knight",
    overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    rating: 9.0,
    releaseYear: 2008,
    releaseDate: "July 18, 2008",
    backdropUrl: "/api/tmdb/img?path=/t/p/w1280/hkBaDkMWbLaf8B1lsWsRX7RVjXX.jpg",
    posterUrl: "/api/tmdb/img?path=/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    genres: ["Action", "Drama", "Thriller"],
    runtime: 152,
    cast: [
      { name: "Christian Bale", character: "Bruce Wayne / Batman", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
      { name: "Heath Ledger", character: "Joker", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" },
      { name: "Gary Oldman", character: "Jim Gordon", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" }
    ],
    crew: [
      { name: "Christopher Nolan", job: "Director" },
      { name: "Jonathan Nolan", job: "Writer" }
    ],
    reviews: [
      { id: "r6", user: "BatFan", rating: 10, content: "Heath Ledger's performance is legendary. This isn't just a comic book movie; it is a crime thriller of epic proportions.", date: "5 days ago", avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100" }
    ],
    trailerUrl: "EXeTwQWrcwY",
    streamingPlatforms: ["Max", "Netflix"],
    production: ["Warner Bros. Pictures", "Legendary Pictures", "Syncopy"]
  },
  {
    id: "6",
    title: "Everything Everywhere All at Once",
    overview: "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes and connecting with the lives she could have led.",
    rating: 8.5,
    releaseYear: 2022,
    releaseDate: "March 25, 2022",
    backdropUrl: "/api/tmdb/img?path=/t/p/w1280/lMoEBHH6H7HnuAWHkXgFWspMPzY.jpg",
    posterUrl: "/api/tmdb/img?path=/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
    genres: ["Sci-Fi", "Comedy", "Fantasy", "Action"],
    runtime: 139,
    cast: [
      { name: "Michelle Yeoh", character: "Evelyn Wang", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100" },
      { name: "Ke Huy Quan", character: "Waymond Wang", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
      { name: "Jamie Lee Curtis", character: "Deirdre Beaubeirdre", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" }
    ],
    crew: [
      { name: "Daniel Kwan", job: "Director" },
      { name: "Daniel Scheinert", job: "Director" }
    ],
    reviews: [
      { id: "r7", user: "BagelWatcher", rating: 9, content: "Chaotic, beautiful, deeply moving. A movie about taxes, hot dogs, laundry, and the meaning of life. I cried over talking rocks.", date: "1 month ago", avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" }
    ],
    trailerUrl: "wxN1T1UxQ2A",
    streamingPlatforms: ["Prime Video", "Hulu"],
    production: ["A24", "AGBO"]
  },
  {
    id: "7",
    title: "Whiplash",
    overview: "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential.",
    rating: 8.5,
    releaseYear: 2014,
    releaseDate: "October 10, 2014",
    backdropUrl: "/api/tmdb/img?path=/t/p/w1280/fRGxZuo7jJUWQsVg9PREb98Aclp.jpg",
    posterUrl: "/api/tmdb/img?path=/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
    genres: ["Drama", "Music"],
    runtime: 107,
    cast: [
      { name: "Miles Teller", character: "Andrew Neiman", avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100" },
      { name: "J.K. Simmons", character: "Terence Fletcher", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" }
    ],
    crew: [
      { name: "Damien Chazelle", job: "Director" },
      { name: "Damien Chazelle", job: "Writer" }
    ],
    reviews: [
      { id: "r8", user: "JazzLover", rating: 9.5, content: "Intense from start to finish. The final 10 minutes are hands-down one of the best scenes in modern cinematic history. J.K. Simmons is terrifying.", date: "3 weeks ago", avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100" }
    ],
    trailerUrl: "7d_jQC68pCw",
    streamingPlatforms: ["Netflix", "Hulu"],
    production: ["Blumhouse Productions", "Bold Films"]
  },
  {
    id: "8",
    title: "Get Out",
    overview: "A young Afro-American visits his white girlfriend's parents for the weekend, where his simmering uneasiness about their reception reaches a boiling point.",
    rating: 7.8,
    releaseYear: 2017,
    releaseDate: "February 24, 2017",
    backdropUrl: "/api/tmdb/img?path=/t/p/w1280/b4LBFmsy3FMn9wAMBRPdKFcWpQs.jpg",
    posterUrl: "/api/tmdb/img?path=/t/p/w500/tFXcEccSqd6QFXsHq2qRaFiKfgF.jpg",
    genres: ["Horror", "Thriller", "Mystery"],
    runtime: 104,
    cast: [
      { name: "Daniel Kaluuya", character: "Chris Washington", avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100" },
      { name: "Allison Williams", character: "Rose Armitage", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100" }
    ],
    crew: [
      { name: "Jordan Peele", job: "Director" },
      { name: "Jordan Peele", job: "Writer" }
    ],
    reviews: [
      { id: "r9", user: "HorrorJunkie", rating: 8.5, content: "Jordan Peele's debut is incredibly smart. It utilizes horror tropes to dissect racial tension and microaggressions. Groundbreaking.", date: "2 months ago", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" }
    ],
    trailerUrl: "sRfnevzM9kQ",
    streamingPlatforms: ["Hulu", "Peacock"],
    production: ["Blumhouse Productions", "QC Entertainment"]
  },
  {
    id: "9",
    title: "La La Land",
    overview: "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.",
    rating: 8.1,
    releaseYear: 2016,
    releaseDate: "December 9, 2016",
    backdropUrl: "/api/tmdb/img?path=/t/p/w1280/iZdih9zQAIwNklgtvMlvOiS3OQx.jpg",
    posterUrl: "/api/tmdb/img?path=/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
    genres: ["Romance", "Drama", "Music", "Comedy"],
    runtime: 128,
    cast: [
      { name: "Ryan Gosling", character: "Sebastian", avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100" },
      { name: "Emma Stone", character: "Mia", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" }
    ],
    crew: [
      { name: "Damien Chazelle", job: "Director" },
      { name: "Justin Hurwitz", job: "Original Music Composer" }
    ],
    reviews: [
      { id: "r10", user: "Dreamer", rating: 9, content: "An gorgeous tribute to classic Hollywood musicals. A bitter-sweet romance with incredible music, choreography, and colors. The opening number is pure joy.", date: "1 month ago", avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100" }
    ],
    trailerUrl: "0pdqf4P9MB8",
    streamingPlatforms: ["Netflix", "Prime Video"],
    production: ["Summit Entertainment", "Marc Platt Productions"]
  },
  {
    id: "10",
    title: "Free Solo",
    overview: "Alex Honnold attempts to conquer the first ever free solo climb of the famed El Capitan's 3,000-foot vertical wall in Yosemite National Park.",
    rating: 8.2,
    releaseYear: 2018,
    releaseDate: "September 28, 2018",
    backdropUrl: "/api/tmdb/img?path=/t/p/w1280/mEkxKNqiM4tCqjkAIoNt4mrJFQp.jpg",
    posterUrl: "/api/tmdb/img?path=/t/p/w500/aNPVMbw4O98pGivvWP4qy1WBdez.jpg",
    genres: ["Documentary", "Adventure"],
    runtime: 100,
    cast: [
      { name: "Alex Honnold", character: "Himself", avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100" },
      { name: "Tommy Caldwell", character: "Himself", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" }
    ],
    crew: [
      { name: "Elizabeth Chai Vasarhelyi", job: "Director" },
      { name: "Jimmy Chin", job: "Director" }
    ],
    reviews: [
      { id: "r11", user: "ClimberD", rating: 10, content: "Sweaty palms from start to finish. Even knowing the outcome, the tension is unimaginable. An incredible study of human drive and psychological focus.", date: "3 months ago", avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" }
    ],
    trailerUrl: "urRVZ4SW7WU",
    streamingPlatforms: ["Disney+", "Hulu"],
    production: ["National Geographic Documentary Films", "Little Monster Films"]
  }
];

export const CATEGORIES_WITH_COLLAGES = [
  { name: "Action", poster: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=300" },
  { name: "Drama", poster: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300" },
  { name: "Sci-Fi", poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300" },
  { name: "Fantasy", poster: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300" },
  { name: "Anime", poster: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300" },
  { name: "Thriller", poster: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=300" },
  { name: "Comedy", poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300" },
  { name: "Romance", poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300" },
  { name: "Documentary", poster: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300" },
  { name: "Horror", poster: "https://images.unsplash.com/photo-1505635330303-319530796a4b?w=300" },
  { name: "International", poster: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=300" }
];

export const MOCK_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "post1",
    user: "CinephileClara",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    userTitle: "Super Reviewer",
    content: "Just re-watched Interstellar in IMAX 70mm and I'm still speechless. The Docking Scene remains the most intense cinematic sequence of the last two decades. That organ track by Zimmer is pure genius.",
    movieTag: "Interstellar",
    likes: 342,
    commentsCount: 54,
    timeAgo: "2 hours ago"
  },
  {
    id: "post2",
    user: "A24_Stan",
    userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
    userTitle: "A24 Member",
    content: "Who is excited for the new A24 project? Their cinematography styles have been single-handedly redefining indie horror and drama visual aesthetics.",
    likes: 189,
    commentsCount: 22,
    timeAgo: "5 hours ago"
  },
  {
    id: "post3",
    user: "Directing101",
    userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    userTitle: "Film Student",
    content: "Analyzing Bong Joon Ho's blocking in Parasite. The way he communicates class divisions purely through staircases, lighting, and vertical positioning is masterclass level storytelling.",
    movieTag: "Parasite",
    likes: 412,
    commentsCount: 87,
    timeAgo: "1 day ago"
  }
];

export const MOCK_CLUBS: MovieClub[] = [
  {
    id: "club1",
    name: "The Sci-Fi Odyssey Club",
    description: "Exploring the cosmos, timelines, and speculative futures one classic film at a time.",
    members: 2430,
    currentMovie: "Dune: Part Two",
    coverUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300"
  },
  {
    id: "club2",
    name: "Ghibli & Hand-drawn Magic",
    description: "A cozy corner for fans of traditional animation, sweeping scores, and whimsical stories.",
    members: 1870,
    currentMovie: "Spirited Away",
    coverUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300"
  },
  {
    id: "club3",
    name: "Noir & Neo-Noir Seekers",
    description: "Dedicated to shadows, morally gray detectives, rain-slicked streets, and sharp dialogue.",
    members: 1210,
    currentMovie: "The Dark Knight",
    coverUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=300"
  }
];

export const TESTIMONIALS = [
  {
    name: "Sarah Jenkins",
    role: "Independent Film Director",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    quote: "CineVerse is the platform I've been waiting for. It elevates film discussion from surface-level remarks into deep, structured community reviews. The interface feels premium and respects the art of filmmaking."
  },
  {
    name: "Marcus Aurelius",
    role: "Film Student at NYU",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    quote: "The AI Companion is spooky good. I typed a convoluted prompt about wanting emotional sci-fi with Hans Zimmer vibe, and it instantly curated a list that hit exactly what I was looking for. My absolute daily go-to."
  },
  {
    name: "Elena Rostova",
    role: "Lead Cinema Critic, CineWeekly",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
    quote: "Unlike major platforms where review feeds are full of trolls, CineVerse fosters genuine film discussions and clubs that bring cinephiles together. The visual aesthetics are sleek, modern, and clean."
  }
];

export const FAQS = [
  {
    question: "What is CineVerse and how does it differ from Letterboxd?",
    answer: "CineVerse is not just a logging tool; it's a social network where cinema meets community. We combine high-fidelity lists and reviews with real-time movie club discussions, custom collaborative watchlists, and a powerful AI Movie Companion that parses moods and cinematography styles to give you perfect recommendations."
  },
  {
    question: "How does the AI Recommendation Companion work?",
    answer: "Our AI model understands natural language queries, semantic movie themes, emotional tones, and streaming provider availability. You can ask it for highly specific inquiries (e.g. 'A slow-burn detective thriller set in rain, like Seven but older') and get detailed, contextual lists with explanations."
  },
  {
    question: "Can I connect CineVerse to my streaming accounts?",
    answer: "Yes! CineVerse integrates streaming availability search (through TMDB and JustWatch APIs) so you can filter your discovery feed and watchlist based on what services you actually subscribe to, like Netflix, Prime, HBO, or Apple TV+."
  },
  {
    question: "Is CineVerse free to use?",
    answer: "Yes, our core features including logging, search, watchlist creation, social features, and community clubs are 100% free. We will soon launch a CineVerse Pro tier with advanced stats analytics, badge icons, and prioritised AI queries."
  }
];
