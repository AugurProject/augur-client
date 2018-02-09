import { createSelector } from 'reselect'
import store from 'src/store'
import { selectMarkets } from 'modules/markets/selectors/markets-all'
import { selectAccountPositionsState } from 'src/select-state'

export default function () {
  return selectPositionsMarkets(store.getState())
}

export const selectPositionsMarkets = createSelector(
  selectMarkets,
  selectAccountPositionsState,
  (markets, positions) => (markets || []).filter(market => Object.keys(positions || {})
    .find(positionMarketID => market.id === positionMarketID))
)
