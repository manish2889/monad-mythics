/**
 * Mock data generation for stories and NFTs
 */

// Generate mock NFT stories data
export const generateNftEntries = (count: number) => {
  const genres = [
    'fantasy',
    'sci-fi',
    'horror',
    'romance',
    'adventure',
    'historical',
    'educational',
    'magical-realism',
  ];

  const authors = [
    {
      name: 'Alex Johnson',
      username: '@alexwrites',
      avatar: '/avatars/avatar-1.png',
    },
    {
      name: 'Sara Chen',
      username: '@sarastories',
      avatar: '/avatars/avatar-2.png',
    },
    {
      name: 'Marcus Lee',
      username: '@marcusworld',
      avatar: '/avatars/avatar-3.png',
    },
    {
      name: 'Emma Davis',
      username: '@emmacraft',
      avatar: '/avatars/avatar-4.png',
    },
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `story-${i + 1}`,
    title: `Story Title ${i + 1}`,
    author: authors[i % authors.length].name,
    authorUsername: authors[i % authors.length].username,
    authorAvatar: authors[i % authors.length].avatar,
    coverImage: `/covers/cover-${(i % 12) + 1}.jpg`,
    price: `${(Math.random() * 2 + 0.05).toFixed(2)} ETH`,
    likes: Math.floor(Math.random() * 500),
    views: Math.floor(Math.random() * 2000) + 100,
    genre: genres[i % genres.length],
    description: `This is a sample description for story #${i + 1}. It showcases the plot and themes of this interesting story.`,
    createdAt: new Date(
      Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000)
    ),
  }));
};

// Export top NFT stories for use in components
export const topNftStories = [
  {
    id: 'top-1',
    title: 'The Last Guardian',
    author: 'Eliza Thompson',
    authorAvatar: '/avatars/avatar-5.png',
    coverImage: '/covers/cover-featured-1.jpg',
    price: '2.35 ETH',
    likes: 1243,
    views: 8754,
    genre: 'fantasy',
    description:
      'A tale of a young hero who discovers they are the last of an ancient order of guardians with the power to save their world from darkness.',
    isTop10: true,
    sales: 142,
  },
  {
    id: 'top-2',
    title: 'Starlight Echoes',
    author: 'Morgan Chen',
    authorAvatar: '/avatars/avatar-6.png',
    coverImage: '/covers/cover-featured-2.jpg',
    price: '1.87 ETH',
    likes: 932,
    views: 6152,
    genre: 'sci-fi',
    description:
      'In the far reaches of the galaxy, a mysterious signal begins repeating from a dead star, drawing explorers and dangers alike.',
    isTop10: true,
    sales: 98,
  },
  {
    id: 'top-3',
    title: 'Whispers in the Walls',
    author: 'James Rivera',
    authorAvatar: '/avatars/avatar-7.png',
    coverImage: '/covers/cover-featured-3.jpg',
    price: '1.65 ETH',
    likes: 875,
    views: 5421,
    genre: 'horror',
    description:
      'A family moves into a historic home only to discover the walls hold secrets of past residents who never truly left.',
    isTop10: true,
    sales: 76,
  },
];

/**
 * Fetches a story by its ID
 */
export function fetchStoryById(
  id: string,
  limit?: number,
  relatedStories?: boolean
): any {
  // Combine top stories with generated stories
  const allStories = [...topNftStories, ...generateNftEntries(90)];

  // If we're looking for related stories
  if (relatedStories) {
    const story = allStories.find((story) => story.id === id);
    if (!story) return [];

    // Find stories of the same genre, excluding the current story
    return allStories
      .filter((s) => s.genre === story.genre && s.id !== id)
      .slice(0, limit || 4);
  }

  // Otherwise return the specific story
  return allStories.find((story) => story.id === id);
}

/**
 * Fetches popular stories by genre
 */
export function fetchPopularStoriesByGenre(
  genre: string,
  limit: number = 8
): any[] {
  // Combine top stories with generated stories
  const allStories = [...topNftStories, ...generateNftEntries(90)];

  // Filter by genre and sort by popularity (likes)
  return allStories
    .filter((story) => story.genre === genre)
    .sort((a, b) => b.likes - a.likes)
    .slice(0, limit);
}
