import { productList } from '../data/productList.js';
import { calcCart } from '../events/calcCart.js';

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

function updateCartText(element, newQuantity) {
  const namePriceText = element
    .querySelector('span')
    .textContent.split('x ')[0];
  element.querySelector('span').textContent =
    `${namePriceText}x ${newQuantity}`;
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

const handleClick = (e) => {
  const target = e.target;

  if (!target.dataset.productId) return;

  const context = createCartContext(target);

  if (target.classList.contains('quantity-change')) {
    updateCartItem(context);
  } else if (target.classList.contains('remove-item')) {
    removeCartItem(context);
  }

  calcCart();
};

export const CartDisplay = () => {
  const element = document.createElement('div');
  element.id = 'cart-items';
  element.addEventListener('click', handleClick);
  return element;
};
