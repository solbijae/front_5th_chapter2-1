import { productList } from '../../data/productList.js';
import { updateSelectedProduct } from '../updateSelectedProduct.js';

export const flashSaleTimer = () => {
  setTimeout(function () {
    setInterval(function () {
      const saleItem =
        productList[Math.floor(Math.random() * productList.length)];
      const hasFlashSale = Math.random() < 0.3;

      if (hasFlashSale && saleItem.quantity > 0) {
        saleItem.price = Math.round(saleItem.price * 0.8);
        alert('번개세일! ' + saleItem.name + '이(가) 20% 할인 중입니다!');
        updateSelectedProduct();
      }
    }, 30000);
  }, Math.random() * 10000);
};
