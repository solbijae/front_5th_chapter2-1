import { Cart } from '../App';
import { Product } from '../data/productList';

export const calcCart = (cart: Cart, prodList: Product[]) => {
  let total = 0;
  let count = 0;
  let subTotal = 0;

  for (const id in cart) {
    const product = prodList.find((p) => p.id === id);

    if (!product) continue;

    const quantity = cart[id];
    const itemTotal = product.price * quantity;
    count += quantity;
    subTotal += itemTotal;

    let discount = 0;
    // 10개 이상 구매시 할인 적용
    if (quantity >= 10) {
      if (product.id === 'p1') discount = 0.1;
      else if (product.id === 'p2') discount = 0.15;
      else if (product.id === 'p3') discount = 0.2;
      else if (product.id === 'p4') discount = 0.05;
      else if (product.id === 'p5') discount = 0.25;
    }

    total += itemTotal * (1 - discount);
  }

  let rate = 0;

  // 30개 이상 구매시 할인 적용
  if (count >= 30) {
    const bulkDiscount = total * 0.25;
    const itemDiscount = subTotal - total;
    if (bulkDiscount > itemDiscount) {
      total = subTotal * 0.75;
      rate = 0.25;
    } else {
      rate = itemDiscount / subTotal;
    }
  } else {
    rate = (subTotal - total) / subTotal;
  }


  const today = new Date();
  const TUESDAY = 2;
  const isSpecialDay = today.getDay() === TUESDAY;
  const SPECIAL_DAY_DISCOUNT_RATE = 0.1;
  if (isSpecialDay) {
    total *= 1 - SPECIAL_DAY_DISCOUNT_RATE;
    rate = Math.max(rate, SPECIAL_DAY_DISCOUNT_RATE);
  }

  return {
    itemCount: count,
    totalAmount: Math.round(total),
    discountRate: rate,
    bonusPoints: Math.floor(total / 1000),
  };
};
