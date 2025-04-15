import { productList } from '../../data/productList.js';
import { updateSelectedProduct } from '../updateSelectedProduct.js';
import { LastSelectedProductIdStore } from '../../store/stores.js';

export const targetSaleTimer = () => {
  setTimeout(function () {
    setInterval(function () {
      const lastSelectedProductId = LastSelectedProductIdStore.get(
        'lastSelectedProductId'
      );
      if (lastSelectedProductId) {
        const targetItem = productList.find(function (item) {
          return item.id !== lastSelectedProductId && item.quantity > 0;
        });

        if (targetItem) {
          alert(
            targetItem.name + '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!'
          );
          targetItem.price = Math.round(targetItem.price * 0.95);
          updateSelectedProduct();
        }
      }
    }, 60000);
  }, Math.random() * 20000);
};
