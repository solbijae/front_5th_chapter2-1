import { productList } from '../data/productList.js';
import * as components from '../components/index.js';

let bonusPoint = 0,
  totalAmount = 0,
  itemCount = 0;

const getCartOriginalTotal = () => {
  totalAmount = 0;
  let undiscountedTotal = 0;

  const cartDisplay = document.getElementById('cart-items');
  const cartItems = cartDisplay.children;
  for (let i = 0; i < cartItems.length; i++) {
    // 장바구니 아이템 ID와 일치하는 상품 정보 찾기
    const cartItem = cartItems[i];
    const currentItem = productList.find(
      (product) => product.id === cartItem.id
    );
    if (!currentItem) continue;

    // 장바구니 아이템의 수량 추출
    const itemQuantity = parseInt(
      cartItem.querySelector('span').textContent.split('x ')[1]
    );

    // 장바구니 아이템의 총 가격 계산
    const itemTotal = currentItem.price * itemQuantity;

    // 총 아이템 수량 업데이트
    itemCount = 0;
    itemCount += itemQuantity;

    // 총 원래 가격 업데이트
    undiscountedTotal += itemTotal;

    // 10개 이상 구매 시 제품 별 차등 할인 적용
    let discount = 0;
    if (itemQuantity >= 10) {
      if (currentItem.id === 'p1') discount = 0.1;
      else if (currentItem.id === 'p2') discount = 0.15;
      else if (currentItem.id === 'p3') discount = 0.2;
      else if (currentItem.id === 'p4') discount = 0.05;
      else if (currentItem.id === 'p5') discount = 0.25;
    }

    // 총 가격 업데이트
    totalAmount += itemTotal * (1 - discount);
  }

  // 할인 전 총액, 개별 할인 적용 후 총액
  return { undiscountedTotal, totalAmount };
};

const calculateBulkDiscount = () => {
  let { undiscountedTotal, totalAmount: itemDiscountedAmount } =
    getCartOriginalTotal();

  const BULK_DISCOUNT_RATE = 0.25;
  const isEligibleForBulkDiscount = itemCount >= 30;

  // 대량 할인 적용 시 금액
  const bulkDiscountedAmount = undiscountedTotal * (1 - BULK_DISCOUNT_RATE);

  // 개별 할인 적용 시 할인율
  const itemDiscountRate =
    (undiscountedTotal - itemDiscountedAmount) / undiscountedTotal;

  let totalAmount = itemDiscountedAmount;
  let discountRate = itemDiscountRate;

  // 대량 할인 조건을 만족하고, 그 할인이 더 클 경우 대량 할인 적용
  if (
    isEligibleForBulkDiscount &&
    bulkDiscountedAmount < itemDiscountedAmount
  ) {
    totalAmount = bulkDiscountedAmount;
    discountRate = BULK_DISCOUNT_RATE;
  }

  // 최종 할인율, 할인 적용 후  총액
  return { discountRate, totalAmount };
};

const calculateSpecialDayDiscount = () => {
  let { discountRate, totalAmount } = calculateBulkDiscount();

  const today = new Date();
  const TUESDAY = 2;
  const isSpecialDay = today.getDay() === TUESDAY;
  const SPECIAL_DAY_DISCOUNT_RATE = 0.1;

  // 화요일 할인 적용
  if (isSpecialDay) {
    totalAmount *= 1 - SPECIAL_DAY_DISCOUNT_RATE; // TODO: 여기 로직이 좀 이상한 것 같아서 확인 필요
    // 기존 할인율과 화요일 할인율 중 더 큰 할인율 적용
    discountRate = Math.max(discountRate, SPECIAL_DAY_DISCOUNT_RATE);
  }

  // 최종 할인율, 할인 적용 후  총액
  return { discountRate, totalAmount };
};

const getCartTotalAmount = () => {
  let { discountRate, totalAmount } = calculateSpecialDayDiscount();
  return { discountRate, totalAmount };
};

const showCartTotalAmount = () => {
  let { discountRate, totalAmount } = getCartTotalAmount();

  // 총액 표시
  const cartTotal = document.getElementById('cart-total');
  cartTotal.textContent = '총액: ' + Math.round(totalAmount) + '원';

  // 할인 적용 시 할인율 표시
  if (discountRate > 0) {
    const discountLabel = components.DiscountRate(discountRate);
    cartTotal.appendChild(discountLabel);
  }

  return totalAmount;
};

const renderBonusPoint = () => {
  // 보너스 포인트 계산
  bonusPoint = Math.floor(totalAmount / 1000);

  // 보너스 포인트 표시
  let pointsTage = document.getElementById('loyalty-points');
  if (!pointsTage) {
    const cartTotal = document.getElementById('cart-total');
    pointsTage = components.PointsTag(bonusPoint);
    cartTotal.appendChild(pointsTage);
  }
  pointsTage.textContent = '(포인트: ' + bonusPoint + ')';
};

function updateStockInfo() {
  let infoMsg = '';

  productList.forEach(function (item) {
    if (item.quantity < 5) {
      infoMsg +=
        item.name +
        ': ' +
        (item.quantity > 0
          ? '재고 부족 (' + item.quantity + '개 남음)'
          : '품절') +
        '\n';
    }
  });
  const stockInfo = document.getElementById('stock-status');
  stockInfo.textContent = infoMsg;
}

export const calcCart = () => {
  totalAmount = showCartTotalAmount();
  updateStockInfo();
  renderBonusPoint();
};
