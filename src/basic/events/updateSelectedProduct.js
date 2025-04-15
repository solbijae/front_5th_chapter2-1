import { SelectedProductStore } from '../store/stores.js';
import { productList } from '../data/productList.js';
import * as components from '../components/index.js';

export const updateSelectedProduct = () => {
  const selectedProduct = SelectedProductStore.get('selectedProduct');
  selectedProduct.innerHTML = '';

  productList.forEach(function (item) {
    const option = components.ItemOption(item);
    selectedProduct.appendChild(option);
  });
};
