import { useEffect, useRef, useState } from 'react';

import { productList } from './data/productList';

interface Cart {
  [key: string]: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const CartApp = () => {
  const [prodList, setProdList] = useState<Product[]>(productList);
  const [lastSelected, setLastSelected] = useState<string | null>(null);
  const [bonusPoints, setBonusPoints] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [cart, setCart] = useState<Cart>({});
  const [discountRate, setDiscountRate] = useState(0);
  const [stockInfo, setStockInfo] = useState('');
  const [selected, setSelected] = useState('p1');

  const cartDisplayRef = useRef(null);
  const sumRef = useRef(null);
  const loyaltyPointRef = useRef(null);

  useEffect(() => {
    updateStockInfo();
    calcCart();
  }, [cart, prodList]);

  useEffect(() => {
    const lightningInterval = setInterval(() => {
      const saleItem = prodList[Math.floor(Math.random() * prodList.length)];

      if (Math.random() < 0.3 && saleItem.quantity > 0) {
        saleItem.price = Math.round(saleItem.price * 0.8);
        alert('번개세일! ' + saleItem.name + '이(가) 20% 할인 중입니다!');
        setProdList([...prodList]);
      }
    }, 30000);

    const suggestInterval = setInterval(() => {
      if (lastSelected) {
        const suggestItem = prodList.find((item) => item.id !== lastSelected && item.quantity > 0);

        if (suggestItem) {
          alert(suggestItem.name + '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!');
          suggestItem.price = Math.round(suggestItem.price * 0.95);
          setProdList([...prodList]);
        }
      }
    }, 60000);

    return () => {
      clearInterval(lightningInterval);
      clearInterval(suggestInterval);
    };
  }, [lastSelected, prodList]);

  const calcCart = () => {
    let total = 0;
    let count = 0;
    let subTotal = 0;

    for (const id in cart) {
      const product = prodList.find((p) => p.id === id);

      if (!product) continue;

      const quantity = cart[id];
      const itemTotal = product.price * quantity;
      count += quantity;
      subTotal += itemTotal;

      let discount = 0;
      if (quantity >= 10) {
        if (product.id === 'p1') discount = 0.1;
        else if (product.id === 'p2') discount = 0.15;
        else if (product.id === 'p3') discount = 0.2;
        else if (product.id === 'p4') discount = 0.05;
        else if (product.id === 'p5') discount = 0.25;
      }

      total += itemTotal * (1 - discount);
    }

    let rate = 0;

    if (count >= 30) {
      const bulkDiscount = total * 0.25;
      const itemDiscount = subTotal - total;
      if (bulkDiscount > itemDiscount) {
        total = subTotal * 0.75;
        rate = 0.25;
      } else {
        rate = itemDiscount / subTotal;
      }
    } else {
      rate = (subTotal - total) / subTotal;
    }

    if (new Date().getDay() === 2) {
      total *= 0.9;
      rate = Math.max(rate, 0.1);
    }

    setItemCount(count);
    setTotalAmount(Math.round(total));
    setDiscountRate(rate);
    setBonusPoints(Math.floor(total / 1000));
  };

  const updateStockInfo = () => {
    let infoMsg = '';

    prodList.forEach((item) => {
      if (item.quantity < 5) {
        infoMsg += `${item.name}: ${item.quantity > 0 ? `재고 부족 (${item.quantity}개 남음)` : '품절'}\n`;
      }
    });
    
    setStockInfo(infoMsg);
  };

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
              <div key={id} id={id} className="flex justify-between items-center mb-2">
                <span>
                  {item.name} - {item.price}원 x {qty}
                </span>
                <div>
                  <button className="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id={id} data-change="-1" onClick={() => handleQuantityChange(id, -1)}>-</button>
                  <button className="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id={id} data-change="1" onClick={() => handleQuantityChange(id, 1)}>+</button>
                  <button className="remove-item bg-red-500 text-white px-2 py-1 rounded" data-product-id={id} onClick={() => handleRemoveFromCart(id)}>삭제</button>
                </div>
              </div>
            );
          })}
        </div>
        <div id="cart-total" ref={sumRef} className="text-xl font-bold my-4">
          총액: {totalAmount}원
          {discountRate > 0 && (
            <span className="text-green-500 ml-2">({(discountRate * 100).toFixed(1)}% 할인 적용)</span>
          )}
          <span ref={loyaltyPointRef} id="loyalty-points" className="text-blue-500 ml-2">
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
            <option key={item.id} value={item.id} disabled={item.quantity === 0}>
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
