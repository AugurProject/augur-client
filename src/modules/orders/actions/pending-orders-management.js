const blockComparison = 3;

export const ADD_PENDING_ORDER = "ADD_PENDING_ORDER";
export const REMOVE_PENDING_ORDER = "REMOVE_PENDING_ORDER";
export const LOAD_PENDING_ORDERS = "LOAD_PENDING_ORDERS";

export const loadPendingOrders = pendingOrders => ({
  type: LOAD_PENDING_ORDERS,
  data: { pendingOrders }
});

export const addPendingOrder = (pendingOrder, marketId) => ({
  type: ADD_PENDING_ORDER,
  data: {
    pendingOrder,
    marketId
  }
});

export const removePendingOrder = (id, marketId) => ({
  type: REMOVE_PENDING_ORDER,
  data: { id, marketId }
});

export const clearPendingOrders = () => (dispatch, getState) => {
  const { blockchain, pendingOrders } = getState();

  if (blockchain.currentBlockNumber) {
    Object.keys(pendingOrders).map(marketId =>
      pendingOrders[marketId].map((pendingOrder, hash) => {
        if (
          pendingOrder &&
          pendingOrder.blockNumber + blockComparison <
            blockchain.currentBlockNumber
        ) {
          delete pendingOrders[marketId][hash];
        }
      })
    );
  }

  dispatch(loadPendingOrders(pendingOrders));
};
