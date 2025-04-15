const ItemOption = (item) => {
  const element = document.createElement('option');
  element.value = item.id;
  element.textContent = `${item.name} - ${item.price}원`;
  if (item.quantity === 0) element.disabled = true;
  return element;
};

export { ItemOption };
