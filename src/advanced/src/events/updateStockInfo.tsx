import { Product } from '../data/productList';

export const updateStockInfo = (prodList: Product[]) => {
  let infoMsg = '';

  prodList.forEach((item) => {
    if (item.quantity < 5) {
      infoMsg += `${item.name}: ${item.quantity > 0 ? `재고 부족 (${item.quantity}개 남음)` : '품절'}\n`;
    }
  });

  return infoMsg;
};
