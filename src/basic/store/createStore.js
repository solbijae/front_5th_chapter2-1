export const createStore = (initialState) => {
  const state = { ...initialState };

  const get = (key) => (key ? state[key] : { ...state });

  const set = (key, value) => {
    if (state[key] === value) return;
    state[key] = value;
  };

  return { get, set };
};
