import { loadMarketsInfo } from 'modules/markets/actions/load-markets-info'
import loadBidsAsks from 'modules/bids-asks/actions/load-bids-asks'
import { loadAccountTrades } from 'modules/my-positions/actions/load-account-trades'
import { loadPriceHistory } from 'modules/market/actions/load-price-history'
import { updateMarketLoading } from 'modules/market/actions/update-market-loading'
import logError from 'utils/log-error'

import { MARKET_FULLY_LOADING, MARKET_FULLY_LOADED } from 'modules/market/constants/market-loading-states'

export const loadFullMarket = (marketId, callback = logError) => (dispatch, getState) => {
  const { marketsData } = getState()
  dispatch(updateMarketLoading({ marketId, state: MARKET_FULLY_LOADING }))

  // if the basic data is already loaded, just load the details
  if (marketsData[marketId]) return dispatch(loadMarketDetails(marketId))

  // if the basic data hasn't loaded yet, load it first
  dispatch(loadMarketsInfo([marketId], (err) => {
    if (err) return callback(err)
    dispatch(loadMarketDetails(marketId, callback))
  }))
}

// load price history, and other non-basic market details here, dispatching
// the necessary actions to save each part in relevant state
export const loadMarketDetails = (marketId, callback = logError) => dispatch => (
  dispatch(loadBidsAsks(marketId, (err) => {
    if (err) return callback(err)
    dispatch(loadAccountTrades({ market: marketId }, (err) => {
      if (err) return callback(err)
      dispatch(loadPriceHistory({ market: marketId }, (err) => {
        if (err) return callback(err)
        dispatch(updateMarketLoading({ marketId, state: MARKET_FULLY_LOADED }))
        callback(null)
      }))
    }))
  }))
)
