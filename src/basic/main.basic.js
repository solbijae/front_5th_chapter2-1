import * as components from './components/index.js';
import { productList } from './data/productList.js';
import {
  SelectedProductStore,
  LastSelectedProductIdStore,
} from './store/stores.js';
import { calcCart } from './events/calcCart.js';
let cartDisplay = components.CartDisplay();
const cartTitle = components.CartTitle();
const cartTotal = components.CartTotal();
const selectedProduct = components.SelectedProduct();
SelectedProductStore.set('selectedProduct', selectedProduct);
const addBtn = components.AddBtn();
const stockInfo = components.StockInfo();

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
}

function startSaleTimer() {
  flashSaleTimer();
  targetSaleTimer();
}

function updateSelectedProduct() {
  const selectedProduct = SelectedProductStore.get('selectedProduct');
  selectedProduct.innerHTML = '';

  productList.forEach(function (item) {
    const option = components.ItemOption(item);
    selectedProduct.appendChild(option);
  });
}

main();

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
