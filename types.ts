
export interface Wish {
  id: string;
  text: string;
  sender?: string;
  envelopeId: string;
  timestamp: number;
  posIndex: number; // Chỉ số cành cây để giữ vị trí khi reload
  ownerId: string;  // ID của người tạo để kiểm soát quyền xóa
  amount?: number;
}

export interface FortuneResult {
  title: string;
  content: string;
  luckLevel: 'Đại Cát' | 'Trung Cát' | 'Tiểu Cát' | 'Bình An';
}

export enum Page {
  HOME = 'home',
  FORTUNE = 'fortune',
  CARDS = 'cards',
  LUCKY_MONEY = 'lucky_money',
  TRADITIONS = 'traditions',
  VIRTUAL_CALL = 'virtual_call',
  POETRY = 'poetry',
  FOOD = 'food',
  ZODIAC = 'zodiac',
  MAPS = 'maps',
  DRAGON_HUNT = 'dragon_hunt',
  BAU_CUA = 'bau_cua',
  QUIZ = 'quiz',
  DECORATE = 'decorate'
}
