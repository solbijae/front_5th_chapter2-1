import * as components from './components/index.js';
import { SelectedProductStore } from './store/stores.js';
import { calcCart } from './events/calcCart.js';
import { startSaleTimer } from './events/sale/startSaleTimer.js';
import { updateSelectedProduct } from './events/updateSelectedProduct.js';

let cartDisplay = components.CartDisplay();
const cartTitle = components.CartTitle();
const cartTotal = components.CartTotal();
const selectedProduct = components.SelectedProduct();
const addBtn = components.AddBtn();
const stockInfo = components.StockInfo();

SelectedProductStore.set('selectedProduct', selectedProduct);

function main() {
  const root = document.getElementById('app');

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

main();
