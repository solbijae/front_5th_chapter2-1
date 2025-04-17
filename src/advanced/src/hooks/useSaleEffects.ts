import { useEffect } from 'react';
import { Product } from '../data/productList';

export const useSaleEffects = (
  prodList: Product[],
  setProdList: (prodList: Product[]) => void,
  lastSelected: string | null
) => {
  useEffect(() => {
    const lightningInterval = setInterval(() => {
      const saleItem = prodList[Math.floor(Math.random() * prodList.length)];

      if (Math.random() < 0.3 && saleItem.quantity > 0) {
        saleItem.price = Math.round(saleItem.price * 0.8);
        alert('번개세일! ' + saleItem.name + '이(가) 20% 할인 중입니다!');
        setProdList([...prodList]);
      }
    }, 30000);

    const suggestInterval = setInterval(() => {
      if (lastSelected) {
        const suggestItem = prodList.find(
          (item) => item.id !== lastSelected && item.quantity > 0
        );

        if (suggestItem) {
          alert(
            suggestItem.name + '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!'
          );
          suggestItem.price = Math.round(suggestItem.price * 0.95);
          setProdList([...prodList]);
        }
      }
    }, 60000);

    return () => {
      clearInterval(lightningInterval);
      clearInterval(suggestInterval);
    };
  }, [lastSelected, prodList]);
};
