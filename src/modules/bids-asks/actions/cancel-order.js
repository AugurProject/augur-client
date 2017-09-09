import { augur } from 'services/augurjs';
import { BUY } from 'modules/transactions/constants/types';
import { CLOSE_DIALOG_CLOSING, CLOSE_DIALOG_FAILED } from 'modules/market/constants/close-dialog-status';
import { updateOrderStatus } from 'modules/bids-asks/actions/update-order-status';
import selectOrder from 'modules/bids-asks/selectors/select-order';
import noop from 'utils/noop';

const TIME_TO_WAIT_BEFORE_FINAL_ACTION_MILLIS = 3000;

const cancelOrder = (orderID, marketID, outcome, orderTypeLabel) => (dispatch, getState) => {
  const { loginAccount, orderBooks, outcomesData, marketsData } = getState();
  const order = selectOrder(orderID, marketID, outcome, orderTypeLabel, orderBooks);
  const market = marketsData[marketID];
  if (order != null && market != null && outcomesData[marketID] != null) {
    const outcome = outcomesData[marketID][outcome];
    if (outcome != null) {
      dispatch(updateOrderStatus(orderID, CLOSE_DIALOG_CLOSING, marketID, outcome, orderTypeLabel));
      augur.trading.cancel({
        _signer: loginAccount.privateKey,
        _market: marketID,
        _orderId: orderID,
        _outcome: outcome,
        _type: orderTypeLabel === BUY ? 1 : 2,
        onSent: noop,
        onSuccess: res => console.log('cancel success:', res),
        onFailed: (err) => {
          console.error('cancel failed:', err);
          dispatch(updateOrderStatus(orderID, CLOSE_DIALOG_FAILED, marketID, outcome, orderTypeLabel));
          setTimeout(() => dispatch(updateOrderStatus(orderID, null, marketID, outcome, orderTypeLabel)), TIME_TO_WAIT_BEFORE_FINAL_ACTION_MILLIS);
        }
      });
    }
  }
};

export default cancelOrder;
