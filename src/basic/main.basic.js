import * as components from './components/index.js';

const productList = [
  { id: 'p1', name: '상품1', price: 10000, quantity: 50 },
  { id: 'p2', name: '상품2', price: 20000, quantity: 30 },
  { id: 'p3', name: '상품3', price: 30000, quantity: 20 },
  { id: 'p4', name: '상품4', price: 15000, quantity: 0 },
  { id: 'p5', name: '상품5', price: 25000, quantity: 10 },
];

let cartDisplay = components.CartDisplay();
const cartTitle = components.CartTitle();
const cartTotal = components.CartTotal();
const selectedProduct = components.SelectedProduct();
const addBtn = components.AddBtn();
const stockInfo = components.StockInfo();

let lastSelectedProductId,
  bonusPoint = 0,
  totalAmount = 0,
  itemCount = 0;

function main() {
  var root = document.getElementById('app');
  const cartWrap = components.CartWrap();
  cartWrap.appendChild(cartTitle);
  cartWrap.appendChild(cartDisplay);
  cartWrap.appendChild(cartTotal);
  cartWrap.appendChild(selectedProduct);
  cartWrap.appendChild(addBtn);
  cartWrap.appendChild(stockInfo);

  const cartContainer = components.CartContainer();
  cartContainer.appendChild(cartWrap);

  updateSelectedProduct();

  root.appendChild(cartContainer);

  calcCart();

  startSaleTimer();
}

function flashSaleTimer() {
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
}

function targetSaleTimer() {
  setTimeout(function () {
    setInterval(function () {
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
}

function startSaleTimer() {
  flashSaleTimer();
  targetSaleTimer();
}

function updateSelectedProduct() {
  selectedProduct.innerHTML = '';

  productList.forEach(function (item) {
    const option = components.ItemOption(item);
    selectedProduct.appendChild(option);
  });
}

const getCartOriginalTotal = () => {
  totalAmount = 0;
  let undiscountedTotal = 0;

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
  cartTotal.textContent = '총액: ' + Math.round(totalAmount) + '원';

  // 할인 적용 시 할인율 표시
  if (discountRate > 0) {
    const discountLabel = components.DiscountRate(discountRate);
    cartTotal.appendChild(discountLabel);
  }

  return totalAmount;
};

function calcCart() {
  totalAmount = showCartTotalAmount();
  updateStockInfo();
  renderBonusPoint();
}

const renderBonusPoint = () => {
  // 보너스 포인트 계산
  bonusPoint = Math.floor(totalAmount / 1000);

  // 보너스 포인트 표시
  let pointsTage = document.getElementById('loyalty-points');
  if (!pointsTage) {
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
  stockInfo.textContent = infoMsg;
}

main();

function addCartItemQuantity(itemToAdd, item) {
  const quantityText = item.querySelector('span');
  const currentQuantity = parseInt(quantityText.textContent.split('x ')[1], 10);
  const newQuantity = currentQuantity + 1;

  // 수량 추가 시 재고가 부족할 경우 예외 처리
  if (newQuantity > itemToAdd.quantity) {
    alert('재고가 부족합니다.');
    return;
  }

  // 장바구니 아이템 수량 UI 업데이트
  quantityText.textContent = `${itemToAdd.name} - ${itemToAdd.price}원 x ${newQuantity}`;

  // 아이템이 장바구니에 추가되었으므로 재고 감소
  itemToAdd.quantity--;
}

function generateCartItem(itemToAdd) {
  const newItem = components.CartItem(itemToAdd);
  cartDisplay.appendChild(newItem);
}

function addItemToCart(itemToAdd) {
  generateCartItem(itemToAdd);

  // 아이템이 장바구니에 추가되었으므로 재고 감소
  itemToAdd.quantity--;
}

addBtn.addEventListener('click', function () {
  const selectedItem = selectedProduct.value;
  const itemToAdd = productList.find(function (product) {
    return product.id === selectedItem;
  });

  if (itemToAdd && itemToAdd.quantity > 0) {
    const item = document.getElementById(itemToAdd.id);
    if (item) {
      // 장바구니에 이미 있는 상품일 경우 수량 증가
      addCartItemQuantity(itemToAdd, item);
    } else {
      // 장바구니에 없는 상품일 경우 상품 추가
      addItemToCart(itemToAdd);
    }

    calcCart();

    lastSelectedProductId = selectedItem;
  }
});

function createCartContext(target) {
  const id = target.dataset.productId;
  const element = document.getElementById(id);
  const quantity = parseInt(
    element.querySelector('span').textContent.split('x ')[1]
  );
  const product = productList.find((p) => p.id === id);

  return {
    id,
    product,
    element,
    quantity,
    changeAmount: parseInt(target.dataset.change) || 0,
  };
}

function updateCartItem(context) {
  const { product, element, quantity, changeAmount } = context;
  const maxQuantity = product.quantity + quantity;
  const newQuantity = quantity + changeAmount;

  if (newQuantity > 0 && newQuantity <= maxQuantity) {
    updateCartText(element, newQuantity);
    product.quantity -= changeAmount;
  } else if (newQuantity <= 0) {
    element.remove();
    product.quantity -= changeAmount;
  } else {
    alert('재고가 부족합니다.');
  }
}

function removeCartItem(context) {
  const { product, element, quantity } = context;
  product.quantity += quantity;
  element.remove();
}

function updateCartText(element, newQuantity) {
  const namePriceText = element
    .querySelector('span')
    .textContent.split('x ')[0];
  element.querySelector('span').textContent =
    `${namePriceText}x ${newQuantity}`;
}

cartDisplay.addEventListener('click', function (event) {
  const target = event.target;

  if (!target.dataset.productId) return;

  const context = createCartContext(target);

  if (target.classList.contains('quantity-change')) {
    updateCartItem(context);
  } else if (target.classList.contains('remove-item')) {
    removeCartItem(context);
  }

  calcCart();
});
