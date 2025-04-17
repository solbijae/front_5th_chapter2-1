import { memo } from 'react';
import { Product } from '../data/productList';

interface CartItemProps {
  item: Product;
  quantity: number;
  onQuantityChange: (id: string, change: number) => void;
  onRemove: (id: string) => void;
}

const CartItem = memo(
  ({ item, quantity, onQuantityChange, onRemove }: CartItemProps) => {
    return (
      <div
        key={item.id}
        id={item.id}
        className="flex justify-between items-center mb-2"
      >
        <span>
          {item.name} - {item.price}원 x {quantity}
        </span>
        <div>
          <button
            className="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1"
            onClick={() => onQuantityChange(item.id, -1)}
          >
            -
          </button>
          <button
            className="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1"
            onClick={() => onQuantityChange(item.id, 1)}
          >
            +
          </button>
          <button
            className="remove-item bg-red-500 text-white px-2 py-1 rounded"
            onClick={() => onRemove(item.id)}
          >
            삭제
          </button>
        </div>
      </div>
    );
  }
);

CartItem.displayName = 'CartItem';

export default CartItem;
