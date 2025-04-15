import {
  SelectedProductStore,
  LastSelectedProductIdStore,
} from '../store/stores.js';
import { productList } from '../data/productList.js';
import * as components from './index.js';
import { calcCart } from '../events/calcCart.js';

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
  const cartDisplay = document.getElementById('cart-items');
  const newItem = components.CartItem(itemToAdd);
  cartDisplay.appendChild(newItem);
}

function addItemToCart(itemToAdd) {
  generateCartItem(itemToAdd);

  // 아이템이 장바구니에 추가되었으므로 재고 감소
  itemToAdd.quantity--;
}

const handleClick = () => {
  const selectedProduct = SelectedProductStore.get('selectedProduct');
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

    LastSelectedProductIdStore.set('lastSelectedProductId', selectedItem);
  }
};

export const AddBtn = () => {
  const element = document.createElement('button');
  element.id = 'add-to-cart';
  element.className = 'bg-blue-500 text-white px-4 py-2 rounded';
  element.textContent = '추가';
  element.addEventListener('click', handleClick);
  return element;
};
