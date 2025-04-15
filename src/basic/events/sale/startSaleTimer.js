import { flashSaleTimer } from './flashSaleTimer.js';
import { targetSaleTimer } from './targetSaleTimer.js';

export const startSaleTimer = () => {
  flashSaleTimer();
  targetSaleTimer();
};
