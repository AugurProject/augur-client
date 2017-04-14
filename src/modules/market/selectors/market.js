/*
This is one of the most important and sensitive selectors in the app.
It builds the fat, heavy, rigid, hierarchical market objects,
that are used to render and display many parts of the ui.
This is the point where the shallow, light, loose, flexible, independent
pieces of state come together to make each market.

IMPORTANT
The assembleMarket() function (where all the action happens) is heavily memoized, and performance sensitive.
Doing things sub-optimally here will cause noticeable performance degradation in the app.
The "trick" is to maximize memoization cache hits as much as possible, and not have assembleMarket()
run any more than it has to.

To achieve that, we pass in the minimum number of the shallowest arguments possible.
For example, instead of passing in the entire `favorites` collection and letting the
function find the one it needs for the market, we instead find the specific favorite
for that market in advance, and only pass in a boolean: `!!favorites[marketID]`
That way the market only gets re-assembled when that specific favorite changes.

This is true for all selectors, but especially important for this one.
*/

import memoize from 'memoizee';
import { formatShares, formatEther, formatPercent, formatNumber } from 'utils/format-number';
import { formatDate } from 'utils/format-date';
import { isMarketDataOpen, isMarketDataExpired } from 'utils/is-market-data-open';

import { BRANCH_ID } from 'modules/app/constants/network';
import { BINARY, CATEGORICAL, SCALAR } from 'modules/markets/constants/market-types';
import { BINARY_INDETERMINATE_OUTCOME_ID, CATEGORICAL_SCALAR_INDETERMINATE_OUTCOME_ID, INDETERMINATE_OUTCOME_NAME } from 'modules/markets/constants/market-outcomes';
import { abi } from 'services/augurjs';

import { toggleFavorite } from 'modules/markets/actions/update-favorites';
import { placeTrade } from 'modules/trade/actions/place-trade';
import { commitReport } from 'modules/reports/actions/commit-report';
import { slashRep } from 'modules/reports/actions/slash-rep';
import { toggleTag } from 'modules/markets/actions/toggle-tag';

import store from 'src/store';

import selectAccountPositions from 'modules/user-open-orders/selectors/positions-plus-asks';
import { selectMarketLink } from 'modules/link/selectors/links';
import selectUserOpenOrders from 'modules/user-open-orders/selectors/user-open-orders';
import selectUserOpenOrdersSummary from 'modules/user-open-orders/selectors/user-open-orders-summary';

import { selectPriceTimeSeries } from 'modules/market/selectors/price-time-series';

import { selectAggregateOrderBook, selectTopBid, selectTopAsk } from 'modules/bids-asks/helpers/select-order-book';
import getOrderBookSeries from 'modules/order-book/selectors/order-book-series';
import getOutstandingShares from 'modules/market/selectors/helpers/get-outstanding-shares';

import { generateTrade, generateTradeSummary } from 'modules/market/selectors/helpers/generate-trade';
import hasUserEnoughFunds from 'modules/trade/helpers/has-user-enough-funds';
import { generateOutcomePositionSummary, generateMarketsPositionsSummary } from 'modules/my-positions/selectors/my-positions-summary';

import { selectReportableOutcomes } from 'modules/reports/selectors/reportable-outcomes';

export default function () {
  return selectSelectedMarket(store.getState());
}

export const selectSelectedMarket = state => selectMarket(state.selectedMarketID);

export const selectMarket = (marketID) => {
  const { marketsData, favorites, reports, outcomesData, netEffectiveTrades, accountTrades, tradesInProgress, priceHistory, orderBooks, branch, orderCancellation, smallestPositions, loginAccount } = store.getState();
  const accountPositions = selectAccountPositions();

  if (!marketID || !marketsData || !marketsData[marketID]) {
    return {};
  }

  const endDate = new Date((marketsData[marketID].endDate * 1000) || 0);

  return assembleMarket(
    marketID,
    marketsData[marketID],
    priceHistory[marketID],
    isMarketDataOpen(marketsData[marketID]),
    isMarketDataExpired(marketsData[marketID], new Date().getTime()),

    !!favorites[marketID],
    outcomesData[marketID],

    selectMarketReport(marketID, reports[branch.id || BRANCH_ID]),
    (accountPositions || {})[marketID],
    (netEffectiveTrades || {})[marketID],
    (accountTrades || {})[marketID],
    tradesInProgress[marketID],

    // the reason we pass in the date parts broken up like this, is because date objects are never equal, thereby always triggering re-assembly, and never hitting the memoization cache
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),

    branch && branch.isReportRevealPhase,
    branch && branch.reportPeriod,

    orderBooks[marketID],
    orderCancellation,
    (smallestPositions || {})[marketID],
    loginAccount,
    store.dispatch);
};

const assembledMarketsCache = {};

export function assembleMarket(
    marketID,
    marketData,
    marketPriceHistory,
    isOpen,
    isExpired,
    isFavorite,
    marketOutcomesData,
    marketReport,
    marketAccountPositions,
    marketNetEffectiveTrades,
    marketAccountTrades,
    marketTradeInProgress,
    endDateYear,
    endDateMonth,
    endDateDay,
    isReportRevealPhase,
    reportPeriod,
    orderBooks,
    orderCancellation,
    smallestPosition,
    loginAccount,
    dispatch) {

  if (!assembledMarketsCache[marketID]) {
    assembledMarketsCache[marketID] = memoize((
      marketID,
      marketData,
      marketPriceHistory,
      isOpen,
      isExpired,
      isFavorite,
      marketOutcomesData,
      marketReport,
      marketAccountPositions,
      marketNetEffectiveTrades,
      marketAccountTrades,
      marketTradeInProgress,
      endDateYear,
      endDateMonth,
      endDateDay,
      isReportRevealPhase,
      reportPeriod,
      orderBooks,
      orderCancellation,
      smallestPosition,
      loginAccount,
      dispatch) => { // console.log('>>assembleMarket<<');

      // console.log('### Assemble Market ### -- ', marketID);

      const market = {
        ...marketData,
        description: marketData.description || '',
        id: marketID
      };

      const now = new Date();

      switch (market.type) {
        case BINARY:
          market.isBinary = true;
          market.isCategorical = false;
          market.isScalar = false;
          break;
        case CATEGORICAL:
          market.isBinary = false;
          market.isCategorical = true;
          market.isScalar = false;
          break;
        case SCALAR:
          market.isBinary = false;
          market.isCategorical = false;
          market.isScalar = true;
          break;
        default:
          break;
      }

      market.endDate = (endDateYear >= 0 && endDateMonth >= 0 && endDateDay >= 0 && formatDate(new Date(endDateYear, endDateMonth, endDateDay))) || null;
      market.endDateLabel = (market.endDate < now) ? 'ended' : 'ends';
      market.creationTime = formatDate(new Date(marketData.creationTime * 1000));

      market.isOpen = isOpen;
      // market.isExpired = isExpired;
      market.isFavorite = isFavorite;

      market.takerFeePercent = formatPercent(marketData.takerFee * 100, { positiveSign: false });
      market.makerFeePercent = formatPercent(marketData.makerFee * 100, { positiveSign: false });
      market.volume = formatShares(marketData.volume, { positiveSign: false });

      market.isRequiredToReportByAccount = !!marketReport; // was the user chosen to report on this market
      market.isPendingReport = market.isRequiredToReportByAccount && !marketReport.reportHash && !isReportRevealPhase; // account is required to report on this unreported market during reporting phase
      market.isReportSubmitted = market.isRequiredToReportByAccount && !!marketReport.reportHash; // the user submitted a report that is not yet confirmed (reportHash === true)
      market.isReported = market.isReportSubmitted && !!marketReport.reportHash.length; // the user fully reported on this market (reportHash === [string])
      market.isMissedReport = market.isRequiredToReportByAccount && !market.isReported && !market.isReportSubmitted && isReportRevealPhase; // the user submitted a report that is not yet confirmed
      market.isReportTabVisible = market.isRequiredToReportByAccount && !isReportRevealPhase;
      market.isSnitchTabVisible = market.tradingPeriod === reportPeriod;

      market.marketLink = selectMarketLink(market, dispatch);
      market.onClickToggleFavorite = () => dispatch(toggleFavorite(marketID));
      market.onSubmitPlaceTrade = outcomeID => dispatch(placeTrade(marketID, outcomeID, marketTradeInProgress));

      market.report = {
        ...marketReport,
        onSubmitReport: (reportedOutcomeID, isUnethical, isIndeterminate) => dispatch(commitReport(market, reportedOutcomeID, isUnethical, isIndeterminate))
      };

      market.outcomes = [];

      let marketTradeOrders = [];

      market.outcomes = Object.keys(marketOutcomesData || {}).map((outcomeID) => {
        const outcomeData = marketOutcomesData[outcomeID];
        const outcomeTradeInProgress = marketTradeInProgress && marketTradeInProgress[outcomeID];

        const outcome = {
          ...outcomeData,
          id: outcomeID,
          marketID,
          lastPrice: formatEther(outcomeData.price || 0, { positiveSign: false })
        };

        if (market.isScalar) {
          // note: not actually a percent
          if (outcome.lastPrice.value) {
            outcome.lastPricePercent = formatNumber(outcome.lastPrice.value, {
              decimals: 2,
              decimalsRounded: 1,
              denomination: '',
              positiveSign: false,
              zeroStyled: true
            });
          } else {
            const midPoint = (abi.bignum(market.minValue).plus(abi.bignum(market.maxValue))).dividedBy(2);
            outcome.lastPricePercent = formatNumber(midPoint, {
              decimals: 2,
              decimalsRounded: 1,
              denomination: '',
              positiveSign: false,
              zeroStyled: true
            });
          }
        } else if (outcome.lastPrice.value) {
          outcome.lastPricePercent = formatPercent(outcome.lastPrice.value * 100, { positiveSign: false });
        } else {
          outcome.lastPricePercent = formatPercent(100 / market.numOutcomes, { positiveSign: false });
        }

        outcome.trade = generateTrade(market, outcome, outcomeTradeInProgress, loginAccount, orderBooks || {});

        const orderBook = selectAggregateOrderBook(outcome.id, orderBooks, orderCancellation);
        outcome.orderBook = orderBook;
        outcome.orderBookSeries = getOrderBookSeries(orderBook);
        outcome.topBid = selectTopBid(orderBook, false);
        outcome.topAsk = selectTopAsk(orderBook, false);
        outcome.position = generateOutcomePositionSummary((marketAccountPositions || {})[outcomeID], (marketAccountTrades || {})[outcomeID], outcome.lastPrice.value, orderBook);

        marketTradeOrders = marketTradeOrders.concat(outcome.trade.tradeSummary.tradeOrders);

        outcome.userOpenOrders = selectUserOpenOrders(outcomeID, orderBooks);

        return outcome;
      }).sort((a, b) => (b.lastPrice.value - a.lastPrice.value) || (a.name < b.name ? -1 : 1));

      market.tags = (market.tags || []).map((tag) => {
        const obj = {
          name: tag && tag.toString(),
          onClick: () => dispatch(toggleTag(tag))
        };
        return obj;
      }).filter(tag => !!tag.name);

      market.outstandingShares = formatNumber(getOutstandingShares(marketOutcomesData || {}));

      market.priceTimeSeries = selectPriceTimeSeries(market.outcomes, marketPriceHistory);

      market.reportableOutcomes = selectReportableOutcomes(market.type, market.outcomes);
      const indeterminateOutcomeID = market.type === BINARY ? BINARY_INDETERMINATE_OUTCOME_ID : CATEGORICAL_SCALAR_INDETERMINATE_OUTCOME_ID;
      market.reportableOutcomes.push({ id: indeterminateOutcomeID, name: INDETERMINATE_OUTCOME_NAME });
      market.onSubmitSlashRep = (salt, report, address, isIndeterminate, isUnethical) => dispatch(slashRep(market, salt, report, address, isIndeterminate, isUnethical));

      market.userOpenOrdersSummary = selectUserOpenOrdersSummary(market.outcomes);

      market.tradeSummary = generateTradeSummary(marketTradeOrders);
      market.tradeSummary.hasUserEnoughFunds = hasUserEnoughFunds(market.outcomes.map(outcome => outcome.trade), loginAccount);

      if (marketAccountTrades) {
        market.myPositionsSummary = generateMarketsPositionsSummary([market]);
        if (market.myPositionsSummary) {
          market.myPositionOutcomes = market.myPositionsSummary.positionOutcomes;
          delete market.myPositionsSummary.positionOutcomes;
        }
      }

      // Update the consensus object:
      //   - formatted reported outcome
      //   - the percentage of correct reports (for binaries only)
      if (marketData.consensus) {
        market.consensus = { ...marketData.consensus };
        if (market.type !== SCALAR && market.reportableOutcomes.length) {
          const marketOutcome = market.reportableOutcomes.find(outcome => outcome.id === market.consensus.outcomeID);
          if (marketOutcome) market.consensus.outcomeName = marketOutcome.name;
        }
        if (market.consensus.proportionCorrect) {
          market.consensus.percentCorrect = formatPercent(abi.bignum(market.consensus.proportionCorrect).times(100));
        }
      } else {
        market.consensus = null;
      }

      return market;
    }, { max: 1 });
  }

  return assembledMarketsCache[marketID].apply(this, arguments); // eslint-disable-line prefer-rest-params
}

export const selectMarketReport = (marketID, branchReports) => {
  if (marketID && branchReports) {
    const branchReportsEventIDs = Object.keys(branchReports);
    const numBranchReports = branchReportsEventIDs.length;
    for (let i = 0; i < numBranchReports; ++i) {
      if (branchReports[branchReportsEventIDs[i]].marketID === marketID) {
        return branchReports[branchReportsEventIDs[i]];
      }
    }
  }
};

export const selectScalarMinimum = (market) => {
  const scalarMinimum = {};
  if (market && market.type === SCALAR) scalarMinimum.minValue = market.minValue;
  return scalarMinimum;
};

export const selectMarketIDFromEventID = (eventID) => {
  const marketIDs = store.getState().eventMarketsMap[eventID];
  if (marketIDs && marketIDs.length) return marketIDs[0];
  return null;
};

export const selectMarketFromEventID = eventID => selectMarket(selectMarketIDFromEventID(eventID));
