import { abi, augur, constants } from '../../../services/augurjs';
import { ZERO } from '../../trade/constants/numbers';
import { BINARY, SCALAR } from '../../markets/constants/market-types';
import { formatEther, formatPercent, formatRealEther, formatRep, formatShares } from '../../../utils/format-number';
import { formatDate } from '../../../utils/format-date';
import { selectMarketLink } from '../../link/selectors/links';
import { formatReportedOutcome } from '../../reports/selectors/reportable-outcomes';
import { loadMarketThenRetryConversion, lookupEventMarketsThenRetryConversion } from '../../transactions/actions/retry-conversion';
import { selectMarketIDFromEventID } from '../../market/selectors/market';

export function loadDataForMarketTransaction(label, log, isRetry, callback) {
	return (dispatch, getState) => {
		const marketID = log.marketID || log.market;
		const market = getState().marketsData[marketID];
		if (!market) {
			if (isRetry) return callback(log);
			return dispatch(loadMarketThenRetryConversion(marketID, label, log, callback));
		}
		return market;
	};
}

export function loadDataForReportingTransaction(label, log, isRetry, callback) {
	return (dispatch, getState) => {
		const { marketsData, outcomesData } = getState();
		const marketID = selectMarketIDFromEventID(log.event);
		if (!marketID) {
			if (isRetry) return callback(log);
			return dispatch(lookupEventMarketsThenRetryConversion(log.event, label, log, callback));
		}
		const market = marketsData[marketID];
		if (!market) {
			if (isRetry) return callback(log);
			return dispatch(loadMarketThenRetryConversion(marketID, label, log, callback));
		}
		return { marketID, market, outcomes: outcomesData[marketID] };
	};
}

export function constructBasicTransaction(hash, status, blockNumber, timestamp, gasFees) {
	const transaction = { hash, status };
	if (blockNumber) transaction.blockNumber = formatDate(new Date(blockNumber * 1000));
	if (timestamp) transaction.timestamp = formatDate(new Date(timestamp * 1000));
	if (gasFees) transaction.gasFees = formatRealEther(gasFees);
	return transaction;
}

export function constructDefaultTransaction(label, log) {
	const transaction = { data: {} };
	transaction.type = label;
	transaction.message = log.message;
	transaction.description = log.description || JSON.stringify(log);
	return transaction;
}

export function constructApprovalTransaction(log) {
	const transaction = { data: {} };
	transaction.type = 'Approved to Send Reputation';
	transaction.description = `Approve ${log._spender} to send Reputation`;
	transaction.message = log.inProgress ? 'approving' : 'approved';
	return transaction;
}

export function constructCollectedFeesTransaction(log) {
	const transaction = { data: {} };
	const repGain = abi.bignum(log.repGain);
	const initialRepBalance = log.initialRepBalance !== undefined ? log.initialRepBalance : abi.bignum(log.newRepBalance).minus(repGain).toFixed();
	transaction.type = `Reporting Payment`;
	if (log.totalReportingRep) {
		const totalReportingRep = abi.bignum(log.totalReportingRep);
		if (!totalReportingRep.eq(constants.ZERO)) {
			const percentRep = formatPercent(abi.bignum(initialRepBalance).dividedBy(totalReportingRep).times(100), { decimals: 0 });
			transaction.message = `${transaction.message} (${percentRep.full})`;
		}
	}
	transaction.description = `Reporting cycle #${log.period}`;
	if (log.cashFeesCollected !== undefined && log.repGain !== undefined) {
		transaction.data.balances = [{
			change: formatEther(log.cashFeesCollected, { positiveSign: true }),
			balance: formatEther(log.newCashBalance)
		}, {
			change: formatRep(log.repGain, { positiveSign: true }),
			balance: formatRep(log.newRepBalance)
		}];
	}
	transaction.bond = { label: 'reporting', value: formatRealEther(log.notReportingBond) };
	const action = log.inProgress ? 'reporting' : 'reported';
	transaction.message = `${action} with ${formatRep(initialRepBalance).full}`;
	return transaction;
}

export function constructDepositTransaction(log) {
	const transaction = { data: {} };
	transaction.type = 'Deposit Ether';
	transaction.description = 'Convert Ether to tradeable Ether token';
	const action = log.inProgress ? 'depositing' : 'deposited';
	transaction.message = `${action} ${formatEther(log.value).full}`;
	return transaction;
}

export function constructRegistrationTransaction(log) {
	const transaction = { data: {} };
	transaction.type = 'Register New Account';
	transaction.description = `Register account ${log.sender.replace('0x', '')}`;
	const action = log.inProgress ? 'saving' : 'saved';
	transaction.message = `${action} registration timestamp`;
	return transaction;
}

export function constructPenalizationCaughtUpTransaction(log) {
	const transaction = { data: {} };
	transaction.type = 'Reporting Cycle Catch-Up';
	transaction.description = `Missed Reporting cycles ${log.penalizedFrom} to cycle ${log.penalizedUpTo}`;
	// TODO link to this cycle in My Reports
	if (log.repLost && log.newRepBalance) {
		transaction.data.balances = [{
			change: formatRep(log.repLost, { positiveSign: true }),
			balance: formatRep(log.newRepBalance)
		}];
	}
	const action = log.inProgress ? 'catching up' : 'caught up';
	transaction.message = `${action} ${parseInt(log.penalizedUpTo, 10) - parseInt(log.penalizedFrom, 10)} cycles`;
	return transaction;
}

export function constructWithdrawTransaction(log) {
	const transaction = { data: {} };
	transaction.type = 'Withdraw Ether';
	transaction.description = 'Convert tradeable Ether token to Ether';
	const action = log.inProgress ? 'withdrawing' : 'withdrew';
	transaction.message = `${action} ${formatEther(log.value).full}`;
	return transaction;
}

export function constructSentEtherTransaction(log, address) {
	const transaction = { data: {} };
	let action;
	if (log._from === address) {
		transaction.type = 'Send Real Ether';
		transaction.description = `Send Real Ether to ${abi.strip_0x(log._to)}`;
		transaction.data.balances = [{
			change: formatRealEther(abi.bignum(log._value).neg(), { positiveSign: true })
		}];
		action = log.inProgress ? 'sending' : 'sent';
	}
	transaction.message = `${action} ETH`;
	return transaction;
}

export function constructSentCashTransaction(log, address) {
	const transaction = { data: {} };
	let action;
	if (log._from === address) {
		transaction.type = 'Send Ether';
		transaction.description = `Send Ether to ${abi.strip_0x(log._to)}`;
		transaction.data.balances = [{
			change: formatEther(abi.bignum(log._value).neg(), { positiveSign: true })
		}];
		action = log.inProgress ? 'sending' : 'sent';
	} else if (log._to === address) {
		transaction.type = 'Receive Ether';
		transaction.description = `Receive Ether from ${abi.strip_0x(log._from)}`;
		transaction.data.balances = [{
			change: formatEther(log._value, { positiveSign: true })
		}];
		action = log.inProgress ? 'receiving' : 'received';
	}
	transaction.message = `${action} ETH`;
	return transaction;
}

export function constructTransferTransaction(log, address) {
	const transaction = { data: {} };
	let action;
	if (log._from === address) {
		transaction.type = 'Send Reputation';
		transaction.description = `Send Reputation to ${abi.strip_0x(log._to)}`;
		transaction.data.balances = [{
			change: formatRep(abi.bignum(log._value).neg(), { positiveSign: true })
		}];
		action = log.inProgress ? 'sending' : 'sent';
	} else if (log._to === address) {
		transaction.type = 'Receive Reputation';
		transaction.description = `Receive Reputation from ${abi.strip_0x(log._from)}`;
		transaction.data.balances = [{
			change: formatRep(log._value, { positiveSign: true })
		}];
		action = log.inProgress ? 'receiving' : 'received';
	}
	transaction.message = `${action} REP`;
	return transaction;
}

export function constructFundedAccountTransaction(log) {
	const transaction = { data: {} };
	transaction.type = 'fund_account';
	if (log.cashBalance && log.repBalance) {
		transaction.data.balances = [{
			change: formatEther(log.cashBalance, { positiveSign: true }),
			balance: formatEther(log.cashBalance)
		}, {
			change: formatRep(log.repBalance, { positiveSign: true }),
			balance: formatRep(log.repBalance)
		}];
	}
	transaction.message = log.inProgress ? 'requesting testnet funding' : '';
	return transaction;
}

export function constructMarketCreatedTransaction(log, description, dispatch) {
	const transaction = { data: {} };
	transaction.type = 'create_market';
	transaction.description = description.split('~|>')[0];
	transaction.marketCreationFee = formatEther(log.marketCreationFee);
	transaction.data.marketLink = selectMarketLink({ id: log.marketID, description: transaction.description }, dispatch);
	transaction.bond = { label: 'event validity', value: formatEther(log.eventBond) };
	const action = log.inProgress ? 'creating' : 'created';
	transaction.message = `${action} market`;
	return transaction;
}

export function constructPayoutTransaction(log, market, dispatch) {
	const transaction = { data: {} };
	transaction.type = 'Claim Trading Payout';
	console.log('payout:', log, market);
	transaction.description = market.description;
	if (log.cashPayout) {
		transaction.data.balances = [{
			change: formatEther(log.cashPayout, { positiveSign: true }),
			balance: formatEther(log.cashBalance)
		}];
	}
	transaction.data.marketLink = selectMarketLink({ id: log.market, description: market.description }, dispatch);
	const action = log.inProgress ? 'closing out' : 'closed out';
	transaction.message = `${action} ${formatShares(log.shares).full}`;
	return transaction;
}

export function constructTradingFeeUpdatedTransaction(log, market, dispatch) {
	const transaction = { data: {} };
	transaction.description = market.description;
	transaction.data.marketLink = selectMarketLink({ id: log.marketID, description: market.description }, dispatch);
	transaction.message = `updated trading fee: ${formatPercent(abi.bignum(log.tradingFee).times(100)).full}`;
	return transaction;
}

export function constructPenalizeTransaction(log, marketID, market, outcomes, dispatch) {
	const transaction = { data: {} };
	transaction.type = 'Compare Report To Consensus';
	const formattedReport = formatReportedOutcome(log.reportValue, market.minValue, market.maxValue, market.type, outcomes);
	transaction.description = market.description;
	transaction.data.marketLink = selectMarketLink({ id: marketID, description: market.description }, dispatch);
	if (log.repchange && log.newafterrep) {
		transaction.data.balances = [{
			change: formatRep(log.repchange, { positiveSign: true }),
			balance: formatRep(log.newafterrep)
		}];
	}
	if (log.inProgress) {
		transaction.message = 'comparing report to consensus';
	} else if (log.reportValue === log.outcome) {
		transaction.message = `✔ report ${formattedReport} matches consensus`;
	} else {
		transaction.message = `✘ report ${formattedReport} does not match consensus ${formatReportedOutcome(log.outcome, market.minValue, market.maxValue, market.type, outcomes)}`;
	}
	return transaction;
}

export function constructSubmittedReportHashTransaction(log, marketID, market, outcomes, decryptionKey, dispatch) {
	const transaction = { data: {} };
	transaction.type = 'commit_report';
	transaction.description = market.description;
	transaction.data.marketLink = selectMarketLink({ id: marketID, description: market.description }, dispatch);
	transaction.data.market = market;
	transaction.data.isUnethical = !log.ethics || abi.bignum(log.ethics).eq(constants.ZERO);
	const action = log.inProgress ? 'committing' : 'committed';
	transaction.message = `${action} to report`;
	if (decryptionKey) {
		const formattedReport = formatReportedOutcome(augur.parseAndDecryptReport([
			log.encryptedReport,
			log.encryptedSalt
		], { derivedKey: decryptionKey }).report, market.minValue, market.maxValue, market.type, outcomes);
		transaction.data.reportedOutcomeID = formattedReport;
		transaction.data.outcome = { name: formattedReport };
		transaction.message = `${transaction.message}: ${formattedReport}`;
	}
	return transaction;
}

export function constructSubmittedReportTransaction(log, marketID, market, outcomes, dispatch) {
	const transaction = { data: {} };
	transaction.type = 'reveal_report';
	transaction.description = market.description;
	transaction.data.marketLink = selectMarketLink({ id: marketID, description: market.description }, dispatch);
	transaction.data.market = market;
	transaction.data.isUnethical = !log.ethics || abi.bignum(log.ethics).eq(constants.ZERO);
	const formattedReport = formatReportedOutcome(log.report, market.minValue, market.maxValue, market.type, outcomes);
	transaction.data.reportedOutcomeID = formattedReport;
	transaction.data.outcome = { name: formattedReport };
	const action = log.inProgress ? 'revealing' : 'revealed';
	transaction.message = `${action} report: ${formatReportedOutcome(log.report, market.minValue, market.maxValue, market.type, outcomes)}`;
	return transaction;
}

export function constructLogFillTxTransaction(trade, marketID, marketType, description, outcomeID, outcomeName, status, dispatch) {
	const transactionID = `${trade.transactionHash}-${trade.tradeid}`;
	const price = formatEther(trade.price);
	const shares = formatShares(trade.amount);
	const bnPrice = abi.bignum(trade.price);
	const tradingFees = trade.maker ? abi.bignum(trade.makerFee) : abi.bignum(trade.takerFee);
	const bnShares = abi.bignum(trade.amount);
	const totalCost = bnPrice.times(bnShares).plus(tradingFees);
	const totalReturn = bnPrice.times(bnShares).minus(tradingFees);
	const totalCostPerShare = totalCost.dividedBy(bnShares);
	const totalReturnPerShare = totalReturn.dividedBy(bnShares);
	let type;
	let perfectType;
	let formattedTotalCost;
	let formattedTotalReturn;
	if (trade.maker) {
		type = trade.type === 'sell' ? 'match_bid' : 'match_ask';
		perfectType = trade.type === 'sell' ? 'bought' : 'sold';
		formattedTotalCost = trade.type === 'sell' ? formatEther(totalCost) : undefined;
		formattedTotalReturn = trade.type === 'buy' ? formatEther(totalReturn) : undefined;
	} else {
		type = trade.type === 'buy' ? 'buy' : 'sell';
		perfectType = trade.type === 'buy' ? 'bought' : 'sold';
		formattedTotalCost = trade.type === 'buy' ? formatEther(totalCost) : undefined;
		formattedTotalReturn = trade.type === 'sell' ? formatEther(totalReturn) : undefined;
	}
	const action = trade.inProgress ? type : perfectType;
	const transaction = {
		[transactionID]: {
			type,
			hash: trade.transactionHash,
			status,
			description,
			data: {
				marketType,
				outcomeName: outcomeName || outcomeID,
				outcomeID,
				marketLink: selectMarketLink({ id: marketID, description }, dispatch)
			},
			message: `${action} ${shares.full} for ${formatEther(trade.type === 'buy' ? totalCostPerShare : totalReturnPerShare).full} / share`,
			numShares: shares,
			noFeePrice: price,
			avgPrice: price,
			timestamp: formatDate(new Date(trade.timestamp * 1000)),
			tradingFees: formatEther(tradingFees),
			feePercent: formatPercent(tradingFees.dividedBy(totalCost).times(100)),
			totalCost: formattedTotalCost,
			totalReturn: formattedTotalReturn,
			gasFees: trade.gasFees && abi.bignum(trade.gasFees).gt(ZERO) ? formatRealEther(trade.gasFees) : null
		}
	};
	return transaction;
}

export function constructLogShortFillTxTransaction(trade, marketID, marketType, description, outcomeID, outcomeName, status, dispatch) {
	const transactionID = `${trade.transactionHash}-${trade.tradeid}`;
	const price = formatEther(trade.price);
	const shares = formatShares(trade.amount);
	const bnPrice = abi.bignum(trade.price);
	const tradingFees = abi.bignum(trade.takerFee);
	const bnShares = abi.bignum(trade.amount);
	const totalCost = bnPrice.times(bnShares).plus(tradingFees);
	const totalCostPerShare = totalCost.dividedBy(bnShares);
	const action = trade.inProgress ? 'short selling' : 'short sold';
	const transaction = {
		[transactionID]: {
			type: 'short_sell',
			hash: trade.transactionHash,
			status,
			description,
			data: {
				marketType,
				outcomeName: outcomeName || outcomeID,
				outcomeID,
				marketLink: selectMarketLink({ id: marketID, description }, dispatch)
			},
			message: `${action} ${shares.full} for ${formatEther(totalCostPerShare).full} / share`,
			numShares: shares,
			noFeePrice: price,
			avgPrice: formatEther(totalCost.minus(bnShares).dividedBy(bnShares).abs()),
			timestamp: formatDate(new Date(trade.timestamp * 1000)),
			tradingFees: formatEther(tradingFees),
			feePercent: formatPercent(tradingFees.dividedBy(totalCost).times(100)),
			totalCost: formatEther(totalCost),
			gasFees: trade.gasFees && abi.bignum(trade.gasFees).gt(ZERO) ? formatRealEther(trade.gasFees) : null
		}
	};
	return transaction;
}

export function constructLogAddTxTransaction(trade, marketID, marketType, description, outcomeID, outcomeName, market, status, dispatch) {
	let type;
	let action;
	if (trade.type === 'buy') {
		type = 'bid';
		action = trade.inProgress ? 'bidding' : 'bid';
	} else if (trade.isShortAsk) {
		type = 'short_ask';
		action = trade.inProgress ? 'short asking' : 'short ask';
	} else {
		type = 'ask';
		action = trade.inProgress ? 'asking' : 'ask';
	}
	const price = formatEther(trade.price);
	const shares = formatShares(trade.amount);
	const makerFee = market.makerFee;
	const takerFee = market.takerFee;
	const maxValue = abi.bignum(market.maxValue);
	const minValue = abi.bignum(market.minValue);
	const fees = augur.calculateFxpTradingFees(makerFee, takerFee);
	const range = marketType === SCALAR ? abi.fix(maxValue.minus(minValue)) : constants.ONE;
	const adjustedFees = augur.calculateFxpMakerTakerFees(augur.calculateFxpAdjustedTradingFee(fees.tradingFee, abi.fix(trade.price), range), fees.makerProportionOfFee, false, true);
	const fxpShares = abi.fix(trade.amount);
	const fxpPrice = abi.fix(trade.price);
	const tradingFees = adjustedFees.maker.times(fxpShares).dividedBy(constants.ONE)
		.floor()
		.times(fxpPrice)
		.dividedBy(constants.ONE)
		.floor();
	let noFeeCost;
	if (trade.isShortAsk) {
		noFeeCost = fxpShares;
	} else {
		noFeeCost = fxpPrice.times(fxpShares).dividedBy(constants.ONE).floor();
	}
	const totalCost = noFeeCost.plus(tradingFees);
	const totalCostPerShare = totalCost.dividedBy(fxpShares).times(constants.ONE).floor();
	const totalReturn = fxpPrice.times(fxpShares).dividedBy(constants.ONE)
		.floor()
		.minus(tradingFees);
	const totalReturnPerShare = totalReturn.dividedBy(fxpShares).times(constants.ONE).floor();
	return {
		[trade.transactionHash]: {
			type,
			status,
			description,
			data: {
				marketType,
				outcomeName: outcomeName || outcomeID,
				outcomeID,
				marketLink: selectMarketLink({ id: marketID, description }, dispatch)
			},
			message: `${action} ${shares.full} for ${formatEther(abi.unfix(trade.type === 'buy' ? totalCostPerShare : totalReturnPerShare)).full} / share`,
			numShares: shares,
			noFeePrice: price,
			freeze: {
				verb: trade.inProgress ? 'freezing' : 'froze',
				noFeeCost: type === 'ask' ? undefined : formatEther(abi.unfix(noFeeCost)),
				tradingFees: formatEther(abi.unfix(tradingFees))
			},
			avgPrice: price,
			timestamp: formatDate(new Date(trade.timestamp * 1000)),
			hash: trade.transactionHash,
			feePercent: formatPercent(abi.unfix(tradingFees.dividedBy(totalCost).times(constants.ONE).floor()).times(100)),
			totalCost: type === 'bid' ? formatEther(abi.unfix(totalCost)) : undefined,
			totalReturn: type === 'ask' ? formatEther(abi.unfix(totalReturn)) : undefined,
			gasFees: trade.gasFees && abi.bignum(trade.gasFees).gt(ZERO) ? formatRealEther(trade.gasFees) : null
		}
	};
}

export function constructLogCancelTransaction(trade, marketID, marketType, description, outcomeID, outcomeName, status, dispatch) {
	const price = formatEther(trade.price);
	const shares = formatShares(trade.amount);
	const action = trade.inProgress ? 'canceling' : 'canceled';
	return {
		[trade.transactionHash]: {
			type: 'cancel_order',
			status,
			description,
			data: {
				order: { type: trade.type, shares },
				marketType,
				outcome: { name: outcomeName || outcomeID },
				outcomeID,
				marketLink: selectMarketLink({ id: marketID, description }, dispatch)
			},
			message: `${action} order to ${trade.type} ${shares.full} for ${price.full} each`,
			numShares: shares,
			noFeePrice: price,
			avgPrice: price,
			timestamp: formatDate(new Date(trade.timestamp * 1000)),
			hash: trade.transactionHash,
			totalReturn: trade.inProgress ? null : formatEther(trade.cashRefund),
			gasFees: trade.gasFees && abi.bignum(trade.gasFees).gt(ZERO) ? formatRealEther(trade.gasFees) : null
		}
	};
}

export function constructTradingTransaction(label, trade, marketID, outcomeID, status) {
	return (dispatch, getState) => {
		const { marketsData, outcomesData } = getState();
		const market = marketsData[marketID];
		const marketOutcomesData = outcomesData[marketID];
		const marketType = market.type;
		const description = market.description;
		let outcomeName;
		if (marketType === BINARY || marketType === SCALAR) {
			outcomeName = null;
		} else {
			outcomeName = (marketOutcomesData ? marketOutcomesData[outcomeID] : {}).name;
		}
		switch (label) {
			case 'log_fill_tx': {
				return constructLogFillTxTransaction(trade, marketID, marketType, description, outcomeID, outcomeName, status, dispatch);
			}
			case 'log_short_fill_tx': {
				return constructLogShortFillTxTransaction(trade, marketID, marketType, description, outcomeID, outcomeName, status, dispatch);
			}
			case 'log_add_tx': {
				return constructLogAddTxTransaction(trade, marketID, marketType, description, outcomeID, outcomeName, market, status, dispatch);
			}
			case 'log_cancel': {
				return constructLogCancelTransaction(trade, marketID, marketType, description, outcomeID, outcomeName, status, dispatch);
			}
			default:
				return null;
		}
	};
}

export function constructMarketTransaction(label, log, market) {
	return (dispatch, getState) => {
		switch (label) {
			case 'payout':
				return constructPayoutTransaction(log, market, dispatch);
			case 'tradingFeeUpdated':
				return constructTradingFeeUpdatedTransaction(log, market, dispatch);
			default:
				return null;
		}
	};
}

export function constructReportingTransaction(label, log, marketID, market, outcomes) {
	return (dispatch, getState) => {
		switch (label) {
			case 'penalize':
				return constructPenalizeTransaction(log, marketID, market, outcomes, dispatch);
			case 'submittedReport':
				return constructSubmittedReportTransaction(log, marketID, market, outcomes, dispatch);
			case 'submittedReportHash':
				return constructSubmittedReportHashTransaction(log, marketID, market, outcomes, getState().loginAccount.derivedKey, dispatch);
			default:
				return null;
		}
	};
}

export function constructTransaction(label, log, isRetry, callback) {
	return (dispatch, getState) => {
		switch (label) {
			case 'Approval':
				return constructApprovalTransaction(log);
			case 'collectedFees':
				return constructCollectedFeesTransaction(log);
			case 'deposit':
				return constructDepositTransaction(log);
			case 'fundedAccount':
				return constructFundedAccountTransaction(log);
			case 'penalizationCaughtUp':
				return constructPenalizationCaughtUpTransaction(log);
			case 'registration':
				return constructRegistrationTransaction(log);
			case 'withdraw':
				return constructWithdrawTransaction(log);
			case 'sentCash':
				return constructSentCashTransaction(log, getState().loginAccount.address);
			case 'sentEther':
				return constructSentEtherTransaction(log, getState().loginAccount.address);
			case 'Transfer':
				return constructTransferTransaction(log, getState().loginAccount.address);
			case 'marketCreated': {
				if (log.description) return constructMarketCreatedTransaction(log, log.description, dispatch);
				const market = dispatch(loadDataForMarketTransaction(label, log, isRetry, callback));
				if (!market) break;
				return constructMarketCreatedTransaction(log, market.description, dispatch);
			}
			case 'payout':
			case 'tradingFeeUpdated': {
				const market = dispatch(loadDataForMarketTransaction(label, log, isRetry, callback));
				if (!market) break;
				return dispatch(constructMarketTransaction(label, log, market));
			}
			case 'penalize':
			case 'submittedReport':
			case 'submittedReportHash': {
				const aux = dispatch(loadDataForReportingTransaction(label, log, isRetry, callback));
				if (!aux) break;
				return dispatch(constructReportingTransaction(label, log, aux.marketID, aux.market, aux.outcomes));
			}
			default:
				return constructDefaultTransaction(label, log);
		}
	};
}
