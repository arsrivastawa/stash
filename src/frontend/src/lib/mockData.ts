export type ItemType = 'video' | 'code' | 'social' | 'article';

export interface StashItem {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  type: ItemType;
  source: string;
  savedAt: string;
}

export const MOCK_ITEMS: StashItem[] = [
  {
    id: '1',
    title: 'Building a Design System from Scratch',
    description: 'A comprehensive guide to creating consistent, scalable design systems that your team will actually use.',
    url: 'https://youtube.com/watch?v=example1',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop',
    type: 'video',
    source: 'YouTube',
    savedAt: '2h ago',
  },
  {
    id: '2',
    title: 'shadcn/ui - Beautiful components built with Radix UI and Tailwind',
    description: 'Beautifully designed components that you can copy and paste into your apps. Accessible. Customizable. Open Source.',
    url: 'https://github.com/shadcn/ui',
    type: 'code',
    source: 'GitHub',
    savedAt: '5h ago',
  },
  {
    id: '3',
    title: 'The Future of Web Development in 2024',
    description: 'Thread: I spent the last 6 months researching where the web is heading. Here are my findings on AI, edge computing, and the new frameworks...',
    url: 'https://twitter.com/example/status/123',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
    type: 'social',
    source: 'Twitter',
    savedAt: '1d ago',
  },
  {
    id: '4',
    title: 'The Perfect Sourdough Recipe',
    description: 'After years of experimentation, I finally cracked the code on making artisan sourdough bread at home with minimal equipment.',
    url: 'https://example.com/sourdough-recipe',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop',
    type: 'article',
    source: 'Medium',
    savedAt: '2d ago',
  },
  {
    id: '5',
    title: 'React Server Components Explained',
    description: 'Deep dive into RSC architecture and how it changes the way we think about React applications.',
    url: 'https://youtube.com/watch?v=example2',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop',
    type: 'video',
    source: 'YouTube',
    savedAt: '3d ago',
  },
  {
    id: '6',
    title: 'framer/motion - Production-ready motion library for React',
    description: 'A production-ready motion library for React. Utilize the power behind Framer, the best prototyping tool for teams.',
    url: 'https://github.com/framer/motion',
    type: 'code',
    source: 'GitHub',
    savedAt: '4d ago',
  },
  {
    id: '7',
    title: 'Why Linear is the Best Product Tool',
    description: 'An analysis of what makes Linear\'s user experience so delightful and how other tools can learn from their approach.',
    url: 'https://example.com/linear-analysis',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
    type: 'article',
    source: 'Substack',
    savedAt: '5d ago',
  },
  {
    id: '8',
    title: 'TypeScript 5.4 Release Notes',
    description: 'Exciting new features including NoInfer utility type, improved narrowing, and better closure analysis.',
    url: 'https://twitter.com/typescript/status/456',
    type: 'social',
    source: 'Twitter',
    savedAt: '1w ago',
  },
];
