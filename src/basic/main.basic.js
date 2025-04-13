const prodList = [
  { id: 'p1', name: '상품1', val: 10000, q: 50 },
  { id: 'p2', name: '상품2', val: 20000, q: 30 },
  { id: 'p3', name: '상품3', val: 30000, q: 20 },
  { id: 'p4', name: '상품4', val: 15000, q: 0 },
  { id: 'p5', name: '상품5', val: 25000, q: 10 },
];

const setProps = (element, props) => {
  for (const [key, value] of Object.entries(props)) {
    switch (key) {
      case 'className':
        element.className = value;
        break;
      case 'style':
        Object.assign(element.style, value);
        break;
      case 'dataset':
        Object.entries(value).forEach(([dataKey, dataVal]) => {
          element.dataset[dataKey] = dataVal;
        });
        break;
      default:
        element.setAttribute(key, value);
        break;
    }
  }
};

const setChildren = (element, children) => {
  const isDomNode = (child) => child instanceof Node;
  const isHTML = (child) => child.trim().startsWith('<'); // TODO: 보안상 문제가 생길 수 있으므로 실제 사용시에는 주의가 필요함
  const isText = (child) =>
    typeof child === 'string' || typeof child === 'number';

  children.flat().forEach((child) => {
    if (isDomNode(child)) return element.appendChild(child);
    if (isHTML(child)) return (element.innerHTML = child);
    if (isText(child))
      return element.appendChild(document.createTextNode(child));
  });
};

const createDomElement = (tag, props = {}, ...children) => {
  const element = document.createElement(tag);

  if (props) setProps(element, props);
  if (children) setChildren(element, children);

  return element;
};

let cartDisp = createDomElement('div', { id: 'cart-items' });
const hTxt = createDomElement(
  'h1',
  { className: 'text-2xl font-bold mb-4' },
  '장바구니'
);
const sum = createDomElement('div', {
  id: 'cart-total',
  className: 'text-xl font-bold my-4',
});
const sel = createDomElement('select', {
  id: 'product-select',
  className: 'border rounded p-2 mr-2',
});
const addBtn = createDomElement(
  'button',
  { id: 'add-to-cart', className: 'bg-blue-500 text-white px-4 py-2 rounded' },
  '추가'
);
const stockInfo = createDomElement('div', {
  id: 'stock-status',
  className: 'text-sm text-gray-500 mt-2',
});

let lastSel,
  bonusPts = 0,
  totalAmt = 0,
  itemCnt = 0;

function main() {
  var root = document.getElementById('app');
  const wrap = createDomElement(
    'div',
    {
      className:
        'max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8',
    },
    hTxt,
    cartDisp,
    sum,
    sel,
    addBtn,
    stockInfo
  );
  const cont = createDomElement('div', { className: 'bg-gray-100 p-8' }, wrap);

  updateSelOpts();

  root.appendChild(cont);

  calcCart();

  setTimeout(function () {
    setInterval(function () {
      var luckyItem = prodList[Math.floor(Math.random() * prodList.length)];
      if (Math.random() < 0.3 && luckyItem.q > 0) {
        luckyItem.val = Math.round(luckyItem.val * 0.8);
        alert('번개세일! ' + luckyItem.name + '이(가) 20% 할인 중입니다!');
        updateSelOpts();
      }
    }, 30000);
  }, Math.random() * 10000);

  setTimeout(function () {
    setInterval(function () {
      if (lastSel) {
        var suggest = prodList.find(function (item) {
          return item.id !== lastSel && item.q > 0;
        });
        if (suggest) {
          alert(
            suggest.name + '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!'
          );
          suggest.val = Math.round(suggest.val * 0.95);
          updateSelOpts();
        }
      }
    }, 60000);
  }, Math.random() * 20000);
}

function updateSelOpts() {
  sel.innerHTML = '';
  prodList.forEach(function (item) {
    const opt = createDomElement(
      'option',
      { value: item.id },
      item.name + ' - ' + item.val + '원'
    );
    if (item.q === 0) opt.disabled = true;
    sel.appendChild(opt);
  });
}

function calcCart() {
  console.log('calcCart');
  totalAmt = 0;
  itemCnt = 0;
  var cartItems = cartDisp.children;
  var subTot = 0;
  for (var i = 0; i < cartItems.length; i++) {
    (function () {
      var curItem;
      for (var j = 0; j < prodList.length; j++) {
        if (prodList[j].id === cartItems[i].id) {
          curItem = prodList[j];
          break;
        }
      }
      var q = parseInt(
        cartItems[i].querySelector('span').textContent.split('x ')[1]
      );
      var itemTot = curItem.val * q;
      var disc = 0;
      itemCnt += q;
      subTot += itemTot;
      if (q >= 10) {
        if (curItem.id === 'p1') disc = 0.1;
        else if (curItem.id === 'p2') disc = 0.15;
        else if (curItem.id === 'p3') disc = 0.2;
        else if (curItem.id === 'p4') disc = 0.05;
        else if (curItem.id === 'p5') disc = 0.25;
      }
      totalAmt += itemTot * (1 - disc);
    })();
  }
  let discRate = 0;
  if (itemCnt >= 30) {
    var bulkDisc = totalAmt * 0.25;
    var itemDisc = subTot - totalAmt;
    if (bulkDisc > itemDisc) {
      totalAmt = subTot * (1 - 0.25);
      discRate = 0.25;
    } else {
      discRate = (subTot - totalAmt) / subTot;
    }
  } else {
    discRate = (subTot - totalAmt) / subTot;
  }
  if (new Date().getDay() === 2) {
    totalAmt *= 1 - 0.1;
    discRate = Math.max(discRate, 0.1);
  }
  sum.textContent = '총액: ' + Math.round(totalAmt) + '원';
  if (discRate > 0) {
    const span = createDomElement(
      'span',
      { className: 'text-green-500 ml-2' },
      '(' + (discRate * 100).toFixed(1) + '% 할인 적용)'
    );
    sum.appendChild(span);
  }
  updateStockInfo();
  renderBonusPts();
}

const renderBonusPts = () => {
  bonusPts = Math.floor(totalAmt / 1000);
  let ptsTag = document.getElementById('loyalty-points');
  if (!ptsTag) {
    ptsTag = createDomElement('span', {
      id: 'loyalty-points',
      className: 'text-blue-500 ml-2',
    });
    sum.appendChild(ptsTag);
  }
  ptsTag.textContent = '(포인트: ' + bonusPts + ')';
};

function updateStockInfo() {
  var infoMsg = '';
  prodList.forEach(function (item) {
    if (item.q < 5) {
      infoMsg +=
        item.name +
        ': ' +
        (item.q > 0 ? '재고 부족 (' + item.q + '개 남음)' : '품절') +
        '\n';
    }
  });
  stockInfo.textContent = infoMsg;
}

main();

addBtn.addEventListener('click', function () {
  var selItem = sel.value;
  var itemToAdd = prodList.find(function (p) {
    return p.id === selItem;
  });
  if (itemToAdd && itemToAdd.q > 0) {
    var item = document.getElementById(itemToAdd.id);
    if (item) {
      var newQty =
        parseInt(item.querySelector('span').textContent.split('x ')[1]) + 1;
      if (newQty <= itemToAdd.q) {
        item.querySelector('span').textContent =
          itemToAdd.name + ' - ' + itemToAdd.val + '원 x ' + newQty;
        itemToAdd.q--;
      } else {
        alert('재고가 부족합니다.');
      }
    } else {
      const newItemHTML = `
        <span>${itemToAdd.name} - ${itemToAdd.val}원 x 1</span>
        <div>
          <button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="${itemToAdd.id}" data-change="-1">-</button>
          <button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="${itemToAdd.id}" data-change="1">+</button>
          <button class="remove-item bg-red-500 text-white px-2 py-1 rounded" data-product-id="${itemToAdd.id}">삭제</button>
        </div>
      `;
      const newItem = createDomElement(
        'div',
        {
          id: itemToAdd.id,
          className: 'flex justify-between items-center mb-2',
        },
        newItemHTML
      );

      console.log('newItem', newItem);
      cartDisp.appendChild(newItem);
      itemToAdd.q--;
    }
    calcCart();
    lastSel = selItem;
  }
});

cartDisp.addEventListener('click', function (event) {
  var tgt = event.target;
  if (
    tgt.classList.contains('quantity-change') ||
    tgt.classList.contains('remove-item')
  ) {
    var prodId = tgt.dataset.productId;
    var itemElem = document.getElementById(prodId);
    var prod = prodList.find(function (p) {
      return p.id === prodId;
    });
    if (tgt.classList.contains('quantity-change')) {
      var qtyChange = parseInt(tgt.dataset.change);
      var newQty =
        parseInt(itemElem.querySelector('span').textContent.split('x ')[1]) +
        qtyChange;
      if (
        newQty > 0 &&
        newQty <=
          prod.q +
            parseInt(itemElem.querySelector('span').textContent.split('x ')[1])
      ) {
        itemElem.querySelector('span').textContent =
          itemElem.querySelector('span').textContent.split('x ')[0] +
          'x ' +
          newQty;
        prod.q -= qtyChange;
      } else if (newQty <= 0) {
        itemElem.remove();
        prod.q -= qtyChange;
      } else {
        alert('재고가 부족합니다.');
      }
    } else if (tgt.classList.contains('remove-item')) {
      var remQty = parseInt(
        itemElem.querySelector('span').textContent.split('x ')[1]
      );
      prod.q += remQty;
      itemElem.remove();
    }
    calcCart();
  }
});
