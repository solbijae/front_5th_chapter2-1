import { useEffect, useRef, useState } from 'react';

import CartItem from './components/CartItem';
import { Product, productList } from './data/productList';
import { calcCart } from './events/calcCart';
import { updateStockInfo } from './events/updateStockInfo';
import { useSaleEffects } from './hooks/useSaleEffects';
export interface Cart {
  [key: string]: number;
}

const CartApp = () => {
  const [prodList, setProdList] = useState<Product[]>(productList);
  const [lastSelected, setLastSelected] = useState<string | null>(null);
  const [bonusPoints, setBonusPoints] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [, setItemCount] = useState(0);
  const [cart, setCart] = useState<Cart>({});
  const [discountRate, setDiscountRate] = useState(0);
  const [stockInfo, setStockInfo] = useState('');
  const [selected, setSelected] = useState('p1');

  const cartDisplayRef = useRef(null);
  const sumRef = useRef(null);
  const loyaltyPointRef = useRef(null);

  useEffect(() => {
    setStockInfo(updateStockInfo(prodList));
    const { itemCount, totalAmount, discountRate, bonusPoints } = calcCart(
      cart,
      prodList
    );
    setItemCount(itemCount);
    setTotalAmount(totalAmount);
    setDiscountRate(discountRate);
    setBonusPoints(bonusPoints);
  }, [cart, prodList]);

  useSaleEffects(prodList, setProdList, lastSelected);

  const handleAddToCart = () => {
    const itemToAdd = prodList.find((p) => p.id === selected);
    if (!itemToAdd || itemToAdd.quantity <= 0) return;

    const curQty = cart[itemToAdd.id] || 0;
    const newQty = curQty + 1;

    if (newQty > itemToAdd.quantity) {
      alert('재고가 부족합니다.');
      return;
    }

    setLastSelected(itemToAdd.id);
    setCart({ ...cart, [itemToAdd.id]: newQty });
  };

  const handleQuantityChange = (id: string, change: number) => {
    const item = prodList.find((p) => p.id === id);
    if (!item) return;

    const curQty = cart[id] || 0;
    const newQty = curQty + change;

    if (newQty > item.quantity) {
      alert('재고가 부족합니다.');
      return;
    }

    if (newQty < 1) {
      handleRemoveFromCart(id);
      return;
    }

    setCart({ ...cart, [id]: newQty });
  };

  const handleRemoveFromCart = (id: string) => {
    const newCart = { ...cart };
    delete newCart[id];
    setCart(newCart);
  };

  return (
    <div className="bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <h1 className="text-2xl font-bold mb-4">장바구니</h1>
        <div id="cart-items" ref={cartDisplayRef}>
          {Object.entries(cart).map(([id, qty]) => {
            const item = prodList.find((p) => p.id === id);
            if (!item) return null;
            return (
              <CartItem
                key={id}
                item={item}
                quantity={qty}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveFromCart}
              />
            );
          })}
        </div>
        <div id="cart-total" ref={sumRef} className="text-xl font-bold my-4">
          총액: {totalAmount}원
          {discountRate > 0 && (
            <span className="text-green-500 ml-2">
              ({(discountRate * 100).toFixed(1)}% 할인 적용)
            </span>
          )}
          <span
            ref={loyaltyPointRef}
            id="loyalty-points"
            className="text-blue-500 ml-2"
          >
            (포인트: {bonusPoints})
          </span>
        </div>
        <select
          id="product-select"
          className="border rounded p-2 mr-2"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {prodList.map((item) => (
            <option
              key={item.id}
              value={item.id}
              disabled={item.quantity === 0}
            >
              {item.name} - {item.price}원
            </option>
          ))}
        </select>
        <button
          id="add-to-cart"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleAddToCart}
        >
          추가
        </button>
        <div id="stock-status" className="text-sm text-gray-500 mt-2">
          <pre>{stockInfo}</pre>
        </div>
      </div>
    </div>
  );
};

export default CartApp;
