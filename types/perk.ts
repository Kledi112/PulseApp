import { Category } from './common';

export type Perk = {
  id: string;
  providerId: string;
  providerName: string;
  title: string;
  description: string;
  category: Category;
  priceAll: number;
  imageUri: string;
};
