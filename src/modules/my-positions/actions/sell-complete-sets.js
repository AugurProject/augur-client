import async from 'async';
import BigNumber from 'bignumber.js';
import { augur } from 'services/augurjs';
import { ZERO } from 'modules/trade/constants/numbers';
import { updateSmallestPositions } from 'modules/my-positions/actions/update-account-trades-data';
import selectLoginAccountPositions from 'modules/my-positions/selectors/login-account-positions';

BigNumber.config({ MODULO_MODE: BigNumber.EUCLID, ROUNDING_MODE: BigNumber.ROUND_HALF_DOWN });

export function sellCompleteSets(marketID, cb) {
  return (dispatch, getState) => {
    if (getState().loginAccount.address) {
      if (marketID) return dispatch(sellCompleteSetsMarket(marketID, cb));
      async.eachSeries(selectLoginAccountPositions().markets, (market, nextMarket) => {
        if (market.outcomes.length !== market.numOutcomes) return nextMarket();
        dispatch(sellCompleteSetsMarket(market.id, nextMarket));
      }, (err) => {
        if (err) console.error('sellCompleteSets error:', err);
        if (cb) cb();
      });
    }
  };
}

export function sellCompleteSetsMarket(marketID, callback) {
  return (dispatch, getState) => {
    const { sellCompleteSetsLock, loginAccount } = getState();
    if (loginAccount.address && !sellCompleteSetsLock[marketID]) {
      dispatch(completeSetsCheck(marketID, (err, smallestPosition) => {
        if (err) {
          if (callback) callback(null, marketID);
        } else {
          dispatch(updateSmallestPositions(marketID, smallestPosition.toFixed()));
          if (smallestPosition.gt(ZERO)) {
            console.error('***COMPLETE SET OF', smallestPosition.toFixed(), 'SHARES FOUND IN MARKET', marketID, 'THIS SHOULD NEVER HAPPEN ON THE UPDATED CONTRACTS AND SOMETHING HAS GONE TERRIBLY WRONG***');
          }
          if (callback) callback(null);
        }
      }));
    } else if (callback) callback(null);
  };
}

export function completeSetsCheck(marketID, callback) {
  return (dispatch, getState) => {
    augur.getPositionInMarket(marketID, getState().loginAccount.address, (position) => {
      if (!position || position.error) {
        return callback(position || marketID);
      }
      const completeSetsBought = getState().completeSetsBought[marketID];
      const outcomes = Object.keys(position);
      const numPositions = outcomes.length;
      if (completeSetsBought) {
        const numCompleteSetsBought = completeSetsBought.length;
        if (numCompleteSetsBought) {
          let totalCompleteSetsBought = ZERO;
          let i;
          for (i = 0; i < numCompleteSetsBought; ++i) {
            totalCompleteSetsBought = totalCompleteSetsBought.plus(completeSetsBought[i].amount);
          }
          for (i = 0; i < numPositions; ++i) {
            position[outcomes[i]] = BigNumber.max(new BigNumber(position[outcomes[i]], 10)
              .minus(totalCompleteSetsBought)
              .toFixed(), ZERO);
          }
        }
      }
      callback(null, getSmallestPositionInMarket(position));
    });
  };
}

export function getSmallestPositionInMarket(position) {
  const numOutcomes = Object.keys(position).length;
  let smallestPosition = new BigNumber(position[1], 10);
  for (let i = 1; i <= numOutcomes; ++i) {
    smallestPosition = BigNumber.min(smallestPosition, new BigNumber(position[i], 10));
  }
  return smallestPosition;
}
