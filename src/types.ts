export interface FoodItem {
  id: string;
  name: string;
  expiry_date: string;
  location: string;
  category: string;
  quantity_unopened: number;
  quantity_opened: number;
}

export type PageState = 
  | { name: 'main' }
  | { name: 'new' }
  | { name: 'edit', itemId: string }
  | { name: 'settings' };
