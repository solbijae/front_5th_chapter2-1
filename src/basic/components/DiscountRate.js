const DiscountRate = (discountRate) => {
  const element = document.createElement('span');
  element.className = 'text-green-500 ml-2';
  element.textContent = '(' + (discountRate * 100).toFixed(1) + '% 할인 적용)';
  return element;
};

export { DiscountRate };
