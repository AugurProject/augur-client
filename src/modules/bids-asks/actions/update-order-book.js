import { augur } from 'services/augurjs';
import { updateMarketPriceHistory } from 'modules/market/actions/update-market-price-history';
import selectOrderBook from 'modules/bids-asks/selectors/select-order-book';

export const UPDATE_ORDER_BOOK = 'UPDATE_ORDER_BOOK';
export const REPLACE_ORDER_BOOK = 'REPLACE_ORDER_BOOK';
export const CLEAR_ORDER_BOOK = 'CLEAR_ORDER_BOOK';
export const UPDATE_IS_FIRST_ORDER_BOOK_CHUNK_LOADED = 'UPDATE_IS_FIRST_ORDER_BOOK_CHUNK_LOADED';

export const updateOrderBook = (marketID, outcome, orderTypeLabel, orderBook) => (
  { type: UPDATE_ORDER_BOOK, marketID, outcome, orderTypeLabel, orderBook }
);
export const replaceOrderBook = (marketID, outcome, orderTypeLabel, orderBook) => (
  { type: REPLACE_ORDER_BOOK, marketID, outcome, orderTypeLabel, orderBook }
);
export const clearOrderBook = (marketID, outcome, orderTypeLabel) => (
  { type: CLEAR_ORDER_BOOK, marketID, outcome, orderTypeLabel }
);
export const updateIsFirstOrderBookChunkLoaded = (marketID, outcome, orderTypeLabel, isLoaded) => (
  { type: UPDATE_IS_FIRST_ORDER_BOOK_CHUNK_LOADED, marketID, outcome, orderTypeLabel, isLoaded }
);

export const addOrder = log => (dispatch, getState) => {
  const { orderBooks, marketsData } = getState();
  const marketID = log.market;
  const outcome = log.outcome;
  const orderTypeLabel = log.type;
  const market = marketsData[marketID];
  const orderBook = selectOrderBook(marketID, outcome, orderTypeLabel, orderBooks);
  if (market && orderBook) {
    const order = augur.trading.orderBook.convertMakeOrderLogToOrder(log, market.type, market.minPrice);
    const updatedOrderBook = augur.trading.orderBook.addOrder(order, orderBook);
    dispatch(replaceOrderBook(marketID, outcome, orderTypeLabel, updatedOrderBook));
  }
};

export const removeOrder = log => (dispatch, getState) => {
  const { orderBooks } = getState();
  const marketID = log.market;
  const outcome = log.outcome;
  const orderTypeLabel = log.type;
  const orderBook = selectOrderBook(marketID, outcome, orderTypeLabel, orderBooks);
  if (orderBook) {
    const updatedOrderBook = augur.trading.orderBook.removeOrder(log.orderId, orderTypeLabel, orderBook);
    dispatch(replaceOrderBook(marketID, updatedOrderBook));
  }
};

export const fillOrder = log => (dispatch, getState) => {
  const { orderBooks, priceHistory } = getState();
  const marketID = log.market;
  const outcome = log.outcome;
  const orderTypeLabel = log.type;
  const orderBook = selectOrderBook(marketID, outcome, orderTypeLabel, orderBooks);
  const matchedType = log.type === 'buy' ? 'sell' : 'buy';
  const updatedOrderBook = augur.trading.orderBook.fillOrder(log.orderId, log.amount, matchedType, orderBook);
  dispatch(replaceOrderBook(marketID, updatedOrderBook));
  const marketPriceHistory = priceHistory[marketID] ? { ...priceHistory[marketID] } : {};
  if (!marketPriceHistory[outcome]) marketPriceHistory[outcome] = [];
  marketPriceHistory[outcome].push(log);
  dispatch(updateMarketPriceHistory(marketID, marketPriceHistory));
};
