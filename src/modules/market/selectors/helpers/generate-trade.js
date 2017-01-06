import memoizerific from 'memoizerific';

import { formatEther, formatShares, formatRealEther } from 'utils/format-number';
import { augur, abi } from 'services/augurjs';

import { calculateMaxPossibleShares } from 'modules/market/selectors/helpers/calculate-max-possible-shares';

import { BUY, SELL } from 'modules/trade/constants/types';
import { BID, ASK } from 'modules/bids-asks/constants/bids-asks-types';
import { BIDS, ASKS } from 'modules/order-book/constants/order-book-order-types';
import { ZERO } from 'modules/trade/constants/numbers';
import * as TRANSACTIONS_TYPES from 'modules/transactions/constants/types';

import { updateTradesInProgress } from 'modules/trade/actions/update-trades-in-progress';
import { makeTradeTransaction } from 'modules/transactions/actions/add-trade-transaction';
import { makeShortSellTransaction } from 'modules/transactions/actions/add-short-sell-transaction';

import { selectAggregateOrderBook } from 'modules/bids-asks/helpers/select-order-book';

import store from 'src/store';

/**
 * @param {Object} market
 * @param {Object} outcome
 * @param {Object} outcomeTradeInProgress
 * @param {Object} loginAccount
 * @param {Object} orderBooks Orders for market
 */
export const generateTrade = memoizerific(5)((market, outcome, outcomeTradeInProgress, loginAccount, orderBooks) => {
	const side = (outcomeTradeInProgress && outcomeTradeInProgress.side) || BUY;
	const numShares = (outcomeTradeInProgress && outcomeTradeInProgress.numShares) || null;
	const limitPrice = (outcomeTradeInProgress && outcomeTradeInProgress.limitPrice) || null;
	const totalFee = (outcomeTradeInProgress && outcomeTradeInProgress.totalFee) || 0;
	const gasFeesRealEth = (outcomeTradeInProgress && outcomeTradeInProgress.gasFeesRealEth) || 0;
	const totalCost = (outcomeTradeInProgress && outcomeTradeInProgress.totalCost) || 0;

	let maxNumShares;
	if (limitPrice != null) {
		const orders = augur.filterByPriceAndOutcomeAndUserSortByPrice(
			orderBooks[side === BUY ? ASK : BID],
			side,
			limitPrice,
			outcome.id,
			loginAccount.address);
		maxNumShares = formatShares(calculateMaxPossibleShares(
			loginAccount,
			orders,
			market.makerFee,
			market.takerFee,
			market.cumulativeScale,
			outcomeTradeInProgress,
			market.type === 'scalar' ? market.minValue : null));
	} else {
		maxNumShares = formatShares(0);
	}

	return {
		side,
		numShares,
		limitPrice,
		maxNumShares,

		totalFee: formatEther(totalFee, { blankZero: true }),
		gasFeesRealEth: formatEther(gasFeesRealEth, { blankZero: true }),
		totalCost: formatEther(totalCost, { blankZero: true }),

		tradeTypeOptions: [
			{ label: BUY, value: BUY },
			{ label: SELL, value: SELL }
		],

		tradeSummary: generateTradeSummary(generateTradeOrders(market, outcome, outcomeTradeInProgress)),
		updateTradeOrder: (shares, limitPrice, side) => store.dispatch(updateTradesInProgress(market.id, outcome.id, side, shares, limitPrice)),
		totalSharesUpToOrder: (orderIndex, side) => totalSharesUpToOrder(market.id, outcome.id, side, orderIndex, orderBooks)
	};
});

const totalSharesUpToOrder = memoizerific(5)((marketID, outcomeID, side, orderIndex, orderBooks) => {
	const { orderCancellation } = store.getState();

	const sideOrders = selectAggregateOrderBook(outcomeID, orderBooks, orderCancellation)[side === TRANSACTIONS_TYPES.BID ? BIDS : ASKS];

	return sideOrders.filter((order, i) => i <= orderIndex).reduce((p, order) => p + order.shares.value, 0);
});

export const generateTradeSummary = memoizerific(5)((tradeOrders) => {
	let tradeSummary = { totalGas: ZERO, tradeOrders: [] };

	if (tradeOrders && tradeOrders.length) {
		tradeSummary = tradeOrders.reduce((p, tradeOrder) => {

			// total gas
			if (tradeOrder.data && tradeOrder.data.gasFees && tradeOrder.data.gasFees.value) {
				p.totalGas = p.totalGas.plus(abi.bignum(tradeOrder.data.gasFees.value));
			}

			// trade order
			p.tradeOrders.push(tradeOrder);

			return p;

		}, tradeSummary);
	}

	tradeSummary.totalGas = formatRealEther(tradeSummary.totalGas);

	return tradeSummary;
});

export const generateTradeOrders = memoizerific(5)((market, outcome, outcomeTradeInProgress) => {
	const tradeActions = outcomeTradeInProgress && outcomeTradeInProgress.tradeActions;

	if (!market || !outcome || !outcomeTradeInProgress || !tradeActions || !tradeActions.length) {
		return [];
	}

	return tradeActions.map((tradeAction) => {
		const noFeePrice = (market.type === 'scalar') ?
			outcomeTradeInProgress.limitPrice :
			tradeAction.noFeePrice;
		if (tradeAction.action === 'SHORT_SELL') {
			return makeShortSellTransaction(
				market.id,
				outcome.id,
				market.type,
				market.description,
				outcome.name,
				tradeAction.shares,
				noFeePrice,
				abi.bignum(tradeAction.costEth).abs().toFixed(),
				tradeAction.feeEth,
				tradeAction.feePercent,
				tradeAction.gasEth,
				store.dispatch);
		}
		return makeTradeTransaction(
			TRANSACTIONS_TYPES[tradeAction.action],
			market.id,
			outcome.id,
			market.type,
			market.description,
			outcome.name,
			tradeAction.shares,
			noFeePrice,
			abi.bignum(tradeAction.costEth).abs().toFixed(),
			tradeAction.feeEth,
			tradeAction.feePercent,
			tradeAction.gasEth,
			store.dispatch);
	});
});
