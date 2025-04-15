import { createStore } from './createStore.js';

export const SelectedProductStore = createStore({
  selectedProduct: null,
});

export const LastSelectedProductIdStore = createStore({
  lastSelectedProductId: null,
});
