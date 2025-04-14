const productList = [
  { id: 'p1', name: '상품1', price: 10000, quantity: 50 },
  { id: 'p2', name: '상품2', price: 20000, quantity: 30 },
  { id: 'p3', name: '상품3', price: 30000, quantity: 20 },
  { id: 'p4', name: '상품4', price: 15000, quantity: 0 },
  { id: 'p5', name: '상품5', price: 25000, quantity: 10 },
];

const setProps = (element, props) => {
  for (const [key, value] of Object.entries(props)) {
    switch (key) {
      case 'className':
        element.className = value;
        break;
      case 'style':
        Object.assign(element.style, value);
        break;
      case 'dataset':
        Object.entries(value).forEach(([dataKey, dataVal]) => {
          element.dataset[dataKey] = dataVal;
        });
        break;
      default:
        element.setAttribute(key, value);
        break;
    }
  }
};

const setChildren = (element, children) => {
  const isDomNode = (child) => child instanceof Node;
  const isHTML = (child) => child.trim().startsWith('<'); // TODO: 보안상 문제가 생길 수 있으므로 실제 사용시에는 주의가 필요함
  const isText = (child) =>
    typeof child === 'string' || typeof child === 'number';

  children.flat().forEach((child) => {
    if (isDomNode(child)) return element.appendChild(child);
    if (isHTML(child)) return (element.innerHTML = child);
    if (isText(child))
      return element.appendChild(document.createTextNode(child));
  });
};

const createDomElement = (tag, props = {}, ...children) => {
  const element = document.createElement(tag);

  if (props) setProps(element, props);
  if (children) setChildren(element, children);

  return element;
};

let cartDisplay = createDomElement('div', { id: 'cart-items' });
const cartTitle = createDomElement(
  'h1',
  { className: 'text-2xl font-bold mb-4' },
  '장바구니'
);
const cartTotal = createDomElement('div', {
  id: 'cart-total',
  className: 'text-xl font-bold my-4',
});
const selectedProduct = createDomElement('select', {
  id: 'product-select',
  className: 'border rounded p-2 mr-2',
});
const addBtn = createDomElement(
  'button',
  { id: 'add-to-cart', className: 'bg-blue-500 text-white px-4 py-2 rounded' },
  '추가'
);
const stockInfo = createDomElement('div', {
  id: 'stock-status',
  className: 'text-sm text-gray-500 mt-2',
});

let lastSelectedProductId,
  bonusPoint = 0,
  totalAmount = 0,
  itemCount = 0;

function main() {
  var root = document.getElementById('app');
  const wrap = createDomElement(
    'div',
    {
      className:
        'max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8',
    },
    cartTitle,
    cartDisplay,
    cartTotal,
    selectedProduct,
    addBtn,
    stockInfo
  );
  const cont = createDomElement('div', { className: 'bg-gray-100 p-8' }, wrap);

  updateSelectedProduct();

  root.appendChild(cont);

  calcCart();

  startSaleTimer();
}

function flashSaleTimer() {
  setTimeout(function () {
    setInterval(function () {
      const saleItem = productList[Math.floor(Math.random() * productList.length)];
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
    const opt = createDomElement(
      'option',
      { value: item.id },
      item.name + ' - ' + item.price + '원'
    );

    if (item.quantity === 0) opt.disabled = true;

    selectedProduct.appendChild(opt);
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
  };

  // 할인 전 총액, 개별 할인 적용 후 총액
  return { undiscountedTotal, totalAmount };
}

const calculateBulkDiscount = () => {
  let { undiscountedTotal, totalAmount: itemDiscountedAmount } = getCartOriginalTotal();

  const BULK_DISCOUNT_RATE = 0.25;
  const isEligibleForBulkDiscount = itemCount >= 30;

  // 대량 할인 적용 시 금액
  const bulkDiscountedAmount = undiscountedTotal * (1 - BULK_DISCOUNT_RATE);

  // 개별 할인 적용 시 할인율
  const itemDiscountRate = (undiscountedTotal - itemDiscountedAmount) / undiscountedTotal;

  let totalAmount = itemDiscountedAmount;
  let discountRate = itemDiscountRate;
  
  // 대량 할인 조건을 만족하고, 그 할인이 더 클 경우 대량 할인 적용
  if (isEligibleForBulkDiscount && bulkDiscountedAmount < itemDiscountedAmount) {
    totalAmount = bulkDiscountedAmount;
    discountRate = BULK_DISCOUNT_RATE;
  }

  // 최종 할인율, 할인 적용 후  총액
  return { discountRate, totalAmount };
}

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
}

const getCartTotalAmount = () => {
  let { discountRate, totalAmount } = calculateSpecialDayDiscount();

  return { discountRate, totalAmount };
}

const showCartTotalAmount = () => {
  let { discountRate, totalAmount } = getCartTotalAmount();

  // 총액 표시
  cartTotal.textContent = '총액: ' + Math.round(totalAmount) + '원';
  
  // 할인 적용 시 할인율 표시
  if (discountRate > 0) {
    const discountLabel = createDomElement(
      'span',
      { className: 'text-green-500 ml-2' },
      '(' + (discountRate * 100).toFixed(1) + '% 할인 적용)'
    );
    cartTotal.appendChild(discountLabel);
  }
}

function calcCart() {
  showCartTotalAmount();
  updateStockInfo();
  renderBonusPoint();
}

const renderBonusPoint = () => {
  // 보너스 포인트 계산
  bonusPoint = Math.floor(totalAmount / 1000);

  // 보너스 포인트 표시
  let ptsTag = document.getElementById('loyalty-points');
  if (!ptsTag) {
    ptsTag = createDomElement('span', {
      id: 'loyalty-points',
      className: 'text-blue-500 ml-2',
    });
    cartTotal.appendChild(ptsTag);
  }
  ptsTag.textContent = '(포인트: ' + bonusPoint + ')';
};

function updateStockInfo() {
  let infoMsg = '';
  
  productList.forEach(function (item) {
    if (item.quantity < 5) {
      infoMsg +=
        item.name +
        ': ' +
        (item.quantity > 0 ? '재고 부족 (' + item.quantity + '개 남음)' : '품절') +
        '\n';
    }
  });
  stockInfo.textContent = infoMsg;
}

main();

addBtn.addEventListener('click', function () {
  var selectedItem = selectedProduct.value;
  var itemToAdd = productList.find(function (p) {
    return p.id === selectedItem;
  });
  if (itemToAdd && itemToAdd.quantity > 0) {
    var item = document.getElementById(itemToAdd.id);
    if (item) {
      var newQty =
        parseInt(item.querySelector('span').textContent.split('x ')[1]) + 1;
      if (newQty <= itemToAdd.quantity) {
        item.querySelector('span').textContent =
          itemToAdd.name + ' - ' + itemToAdd.price + '원 x ' + newQty;
        itemToAdd.quantity--;
      } else {
        alert('재고가 부족합니다.');
      }
    } else {
      const newItemHTML = `
        <span>${itemToAdd.name} - ${itemToAdd.price}원 x 1</span>
        <div>
          <button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="${itemToAdd.id}" data-change="-1">-</button>
          <button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="${itemToAdd.id}" data-change="1">+</button>
          <button class="remove-item bg-red-500 text-white px-2 py-1 rounded" data-product-id="${itemToAdd.id}">삭제</button>
        </div>
      `;
      const newItem = createDomElement(
        'div',
        {
          id: itemToAdd.id,
          className: 'flex justify-between items-center mb-2',
        },
        newItemHTML
      );

      cartDisplay.appendChild(newItem);
      itemToAdd.quantity--;
    }
    calcCart();
    lastSelectedProductId = selectedItem;
  }
});

cartDisplay.addEventListener('click', function (event) {
  const target = event.target;
  if (
    target.classList.contains('quantity-change') ||
    target.classList.contains('remove-item')
  ) {
    var prodId = target.dataset.productId;
    var itemElem = document.getElementById(prodId);
    var prod = productList.find(function (p) {
      return p.id === prodId;
    });
    if (target.classList.contains('quantity-change')) {
      var qtyChange = parseInt(target.dataset.change);
      var newQty =
        parseInt(itemElem.querySelector('span').textContent.split('x ')[1]) +
        qtyChange;
      if (
        newQty > 0 &&
        newQty <=
          prod.quantity +
            parseInt(itemElem.querySelector('span').textContent.split('x ')[1])
      ) {
        itemElem.querySelector('span').textContent =
          itemElem.querySelector('span').textContent.split('x ')[0] +
          'x ' +
          newQty;
        prod.quantity -= qtyChange;
      } else if (newQty <= 0) {
        itemElem.remove();
        prod.quantity -= qtyChange;
      } else {
        alert('재고가 부족합니다.');
      }
    } else if (target.classList.contains('remove-item')) {
      const remQty = parseInt(
        itemElem.querySelector('span').textContent.split('x ')[1]
      );
      prod.quantity += remQty;
      itemElem.remove();
    }
    calcCart();
  }
});
