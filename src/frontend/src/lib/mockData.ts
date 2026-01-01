export type ItemType = 'video' | 'code' | 'social' | 'article' | 'stashDefault';

export interface StashItem {
  id: string;
  title: string;
  description: string;
  originalUrl: string;
  imageUrl?: string;
  type: ItemType;
  source: string;
  createdAt: string;
}