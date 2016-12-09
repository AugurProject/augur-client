import { assert } from 'chai';
import proxyquire from 'proxyquire';
import sinon from 'sinon';
import * as mocks from '../../mockStore';
import { tradeTestState, stubUpdateExistingTransaction } from '../constants';

describe('modules/trade/actions/process-ask.js', () => {
	proxyquire.noPreserveCache();
	const { state, mockStore } = mocks.default;
	const testState = Object.assign({}, state, tradeTestState);
	const store = mockStore(testState);
	const mockAugur = { augur: { sell: () => {} } };

	sinon.stub(mockAugur.augur, "sell", (argsObj) => {
		assert.isString(argsObj.amount, `Didn't pass the amount as a string as expected`);
		assert.isString(argsObj.price, `Didn't pass the price as string as expected`);
		assert.isString(argsObj.market, `Didn't pass a string for the market ID as expected`);
		assert.isString(argsObj.outcome, `Didn't pass the outcomeID as a string`);
		assert.isObject(argsObj.scalarMinMax, `Didn't pass the scalarMinMax as an object as expected.`);
		argsObj.onSuccess({ hash: 'testHash', timestamp: 1480000000, gasFees: '0.1' });
		argsObj.onFailed({ message: 'this is an error' });
	});

	const mockLoadBidAsks = { loadBidsAsks: () => {} };
	sinon.stub(mockLoadBidAsks, 'loadBidsAsks', (marketID, cb) => {
		assert.isString(marketID, `didn't pass a marketID as a string to loadBidsAsks`);
		cb(undefined, store.getState().orderBooks[marketID]);
		return { type: 'LOAD_BIDS_ASKS' };
	});

	const mockUpdateExisitngTransaction = { updateExistingTransaction: () => {} };

	sinon.stub(mockUpdateExisitngTransaction, 'updateExistingTransaction', stubUpdateExistingTransaction);

	const action = proxyquire('../../../src/modules/trade/actions/process-ask.js', {
		'../../../services/augurjs': mockAugur,
		'../../bids-asks/actions/load-bids-asks': mockLoadBidAsks,
		'../../transactions/actions/update-existing-transaction': mockUpdateExisitngTransaction
	});

	beforeEach(() => {
		store.clearActions();
	});

	afterEach(() => {
		store.clearActions();
	});

	it('should process an ask for a binary market', () => {
		// transactionID, marketID, outcomeID, numShares, limitPrice, totalEthWithFee, tradingFeesEth, gasFeesRealEth
		store.dispatch(action.processAsk('transid1', 'testBinaryMarketID', '2', '10', '0.5', '0.1234', '0.1', '0.005'));
		assert.deepEqual(store.getActions(), [
			{
				type: 'UPDATE_EXISTING_TRANSACTION',
				transactionID: 'transid1',
				data: {
					status: 'placing ask...',
					message: 'asking 10 shares for 0.0123 ETH each',
					freeze: {
						verb: 'freezing',
						tradingFees: {
							value: 0.1,
							formattedValue: 0.1,
							formatted: '0.1000',
							roundedValue: 0.1,
							rounded: '0.1000',
							minimized: '0.1',
							denomination: ' ETH',
							full: '0.1000 ETH'
						}
					},
					totalReturn: {
						value: 0.0234,
						formattedValue: 0.0234,
						formatted: '0.0234',
						roundedValue: 0.0234,
						rounded: '0.0234',
						minimized: '0.0234',
						denomination: ' ETH (estimated)',
						full: '0.0234 ETH (estimated)'
					},
					gasFees: {
						value: 0.005,
						formattedValue: 0.005,
						formatted: '0.0050',
						roundedValue: 0.005,
						rounded: '0.0050',
						minimized: '0.005',
						denomination: ' real ETH (estimated)',
						full: '0.0050 real ETH (estimated)'
					}
				}
			},
			{
				type: 'UPDATE_EXISTING_TRANSACTION',
				transactionID: 'transid1',
				data: {
					hash: 'testHash',
					timestamp: 1480000000,
					status: 'updating order book',
					message: 'ask 10 shares for 0.0123 ETH each',
					freeze: {
						verb: 'froze',
						tradingFees: {
							value: 0.1,
							formattedValue: 0.1,
							formatted: '0.1000',
							roundedValue: 0.1,
							rounded: '0.1000',
							minimized: '0.1',
							denomination: ' ETH',
							full: '0.1000 ETH'
						}
					},
					totalReturn: {
						value: 0.0234,
						formattedValue: 0.0234,
						formatted: '0.0234',
						roundedValue: 0.0234,
						rounded: '0.0234',
						minimized: '0.0234',
						denomination: ' ETH (estimated)',
						full: '0.0234 ETH (estimated)'
					},
					gasFees: {
						value: 0.1,
						formattedValue: 0.1,
						formatted: '0.1000',
						roundedValue: 0.1,
						rounded: '0.1000',
						minimized: '0.1',
						denomination: ' real ETH',
						full: '0.1000 real ETH'
					}
				}
			},
			{
				type: 'UPDATE_EXISTING_TRANSACTION',
				transactionID: 'transid1',
				data: {
					status: 'success'
				}
			},
			{ type: 'LOAD_BIDS_ASKS' },
			{
				type: 'UPDATE_EXISTING_TRANSACTION',
				transactionID: 'transid1',
				data: {
					status: 'failed',
					message: 'this is an error'
				}
			}
		], `Didn't produce the expected actions with the expected calculations`);
	});

	it('should process an ask for a categorical market', () => {
		// transactionID, marketID, outcomeID, numShares, limitPrice, totalEthWithFee, tradingFeesEth, gasFeesRealEth
		store.dispatch(action.processAsk('transid1', 'testCategoricalMarketID', '1', '15', '0.55', '0.05', '0.1', '0.005'));
		assert.deepEqual(store.getActions(), [
			{
				type: 'UPDATE_EXISTING_TRANSACTION',
				transactionID: 'transid1',
				data: {
					status: 'placing ask...',
					message: 'asking 15 shares for 0.0033 ETH each',
					freeze: {
						verb: 'freezing',
						tradingFees: {
							value: 0.1,
							formattedValue: 0.1,
							formatted: '0.1000',
							roundedValue: 0.1,
							rounded: '0.1000',
							minimized: '0.1',
							denomination: ' ETH',
							full: '0.1000 ETH'
						}
					},
					totalReturn: {
						value: -0.05,
						formattedValue: -0.05,
						formatted: '-0.0500',
						roundedValue: -0.05,
						rounded: '-0.0500',
						minimized: '-0.05',
						denomination: ' ETH (estimated)',
						full: '-0.0500 ETH (estimated)'
					},
					gasFees: {
						value: 0.005,
						formattedValue: 0.005,
						formatted: '0.0050',
						roundedValue: 0.005,
						rounded: '0.0050',
						minimized: '0.005',
						denomination: ' real ETH (estimated)',
						full: '0.0050 real ETH (estimated)'
					}
				}
			}, {
				type: 'UPDATE_EXISTING_TRANSACTION',
				transactionID: 'transid1',
				data: {
					hash: 'testHash',
					timestamp: 1480000000,
					status: 'updating order book',
					message: 'ask 15 shares for 0.0033 ETH each',
					freeze: {
						verb: 'froze',
						tradingFees: {
							value: 0.1,
							formattedValue: 0.1,
							formatted: '0.1000',
							roundedValue: 0.1,
							rounded: '0.1000',
							minimized: '0.1',
							denomination: ' ETH',
							full: '0.1000 ETH'
						}
					},
					totalReturn: {
						value: -0.05,
						formattedValue: -0.05,
						formatted: '-0.0500',
						roundedValue: -0.05,
						rounded: '-0.0500',
						minimized: '-0.05',
						denomination: ' ETH (estimated)',
						full: '-0.0500 ETH (estimated)'
					},
					gasFees: {
						value: 0.1,
						formattedValue: 0.1,
						formatted: '0.1000',
						roundedValue: 0.1,
						rounded: '0.1000',
						minimized: '0.1',
						denomination: ' real ETH',
						full: '0.1000 real ETH'
					}
				}
			}, {
				type: 'UPDATE_EXISTING_TRANSACTION',
				transactionID: 'transid1',
				data: {
					status: 'success'
				}
			},
 			{ type: 'LOAD_BIDS_ASKS' },
 			{
				type: 'UPDATE_EXISTING_TRANSACTION',
				transactionID: 'transid1',
				data: {
					status: 'failed',
					message: 'this is an error'
				}
			}
		], `Didn't produce the correct actions or calculations`);
	});

	it('should process an ask for a scalar market', () => {
		// transactionID, marketID, outcomeID, numShares, limitPrice, totalEthWithFee, tradingFeesEth, gasFeesRealEth
		store.dispatch(action.processAsk('transid3', 'testScalarMarketID', '1', '10', '55', '0.1234', '0.1', '0.005'));
		assert.deepEqual(store.getActions(), [
			{
				type: 'UPDATE_EXISTING_TRANSACTION',
				transactionID: 'transid3',
				data: {
					status: 'placing ask...',
					message: 'asking 10 shares for 0.0123 ETH each',
					freeze: {
						verb: 'freezing',
						tradingFees: {
							value: 0.1,
							formattedValue: 0.1,
							formatted: '0.1000',
							roundedValue: 0.1,
							rounded: '0.1000',
							minimized: '0.1',
							denomination: ' ETH',
							full: '0.1000 ETH'
						}
					},
					totalReturn: {
						value: 0.0234,
						formattedValue: 0.0234,
						formatted: '0.0234',
						roundedValue: 0.0234,
						rounded: '0.0234',
						minimized: '0.0234',
						denomination: ' ETH (estimated)',
						full: '0.0234 ETH (estimated)'
					},
					gasFees: {
						value: 0.005,
						formattedValue: 0.005,
						formatted: '0.0050',
						roundedValue: 0.005,
						rounded: '0.0050',
						minimized: '0.005',
						denomination: ' real ETH (estimated)',
						full: '0.0050 real ETH (estimated)'
					}
				}
			}, {
				type: 'UPDATE_EXISTING_TRANSACTION',
				transactionID: 'transid3',
				data: {
					hash: 'testHash',
					timestamp: 1480000000,
					status: 'updating order book',
					message: 'ask 10 shares for 0.0123 ETH each',
					freeze: {
						verb: 'froze',
						tradingFees: {
							value: 0.1,
							formattedValue: 0.1,
							formatted: '0.1000',
							roundedValue: 0.1,
							rounded: '0.1000',
							minimized: '0.1',
							denomination: ' ETH',
							full: '0.1000 ETH'
						}
					},
					totalReturn: {
						value: 0.0234,
						formattedValue: 0.0234,
						formatted: '0.0234',
						roundedValue: 0.0234,
						rounded: '0.0234',
						minimized: '0.0234',
						denomination: ' ETH (estimated)',
						full: '0.0234 ETH (estimated)'
					},
					gasFees: {
						value: 0.1,
						formattedValue: 0.1,
						formatted: '0.1000',
						roundedValue: 0.1,
						rounded: '0.1000',
						minimized: '0.1',
						denomination: ' real ETH',
						full: '0.1000 real ETH'
					}
				}
			}, {
				type: 'UPDATE_EXISTING_TRANSACTION',
				transactionID: 'transid3',
				data: {
					status: 'success'
				}
			},
			{ type: 'LOAD_BIDS_ASKS' },
			{
				type: 'UPDATE_EXISTING_TRANSACTION',
				transactionID: 'transid3',
				data: {
					status: 'failed',
					message: 'this is an error'
				}
			}
		], `Didn't produce the expected actions and calulations`);
	});

	it(`should fail gracefully if transactionID is undefined or null`, () => {
		// transactionID, marketID, outcomeID, numShares, limitPrice, totalEthWithFee, tradingFeesEth, gasFeesRealEth
		store.dispatch(action.processAsk(undefined, 'testBinaryMarketID', '2', '10', '0.5', '0.1234', '0.1', '0.005'));
		assert.deepEqual(store.getActions(), [], `Dispatched action objects when nothing should have been dispatched.`);
		// Both should return no actions, this should simply return a console.error in the event of transactionID being undefined/null
		store.dispatch(action.processAsk(null, 'testBinaryMarketID', '2', '10', '0.5', '0.1234', '0.1', '0.005'));
		assert.deepEqual(store.getActions(), [], `Dispatched action objects when nothing should have been dispatched.`);
	});

	it(`should fail gracefully if numShares is undefined or null`, () => {
		// transactionID, marketID, outcomeID, numShares, limitPrice, totalEthWithFee, tradingFeesEth, gasFeesRealEth
		store.dispatch(action.processAsk('transid1', 'testBinaryMarketID', '2', undefined, '0.5', '0.1234', '0.1', '0.005'));
		assert.deepEqual(store.getActions(), [ { type: 'UPDATE_EXISTING_TRANSACTION',
    transactionID: 'transid1',
    data:
     { status: 'failed',
       message: 'invalid limit price "0.5" or shares "undefined"' } } ], `Didn't dispatch a failed UPDATE_EXISTING_TRANSACTION action object`);

		store.clearActions();

		store.dispatch(action.processAsk('transid1', 'testBinaryMarketID', '2', null, '0.5', '0.1234', '0.1', '0.005'));
		assert.deepEqual(store.getActions(), [ { type: 'UPDATE_EXISTING_TRANSACTION',
    transactionID: 'transid1',
    data:
     { status: 'failed',
       message: 'invalid limit price "0.5" or shares "null"' } } ], `Didn't dispatch a failed UPDATE_EXISTING_TRANSACTION action object`);
	});

	it(`should fail gracefully if limitPrice is undefined or null`, () => {
		// transactionID, marketID, outcomeID, numShares, limitPrice, totalEthWithFee, tradingFeesEth, gasFeesRealEth
		store.dispatch(action.processAsk('transid1', 'testBinaryMarketID', '2', '10', undefined, '0.1234', '0.1', '0.005'));
		assert.deepEqual(store.getActions(), [ { type: 'UPDATE_EXISTING_TRANSACTION',
    transactionID: 'transid1',
    data:
     { status: 'failed',
       message: 'invalid limit price "undefined" or shares "10"' } } ], `Didn't dispatch a failed UPDATE_EXISTING_TRANSACTION action object`);

		store.clearActions();

		store.dispatch(action.processAsk('transid1', 'testBinaryMarketID', '2', '10', null, '0.1234', '0.1', '0.005'));
		assert.deepEqual(store.getActions(), [ { type: 'UPDATE_EXISTING_TRANSACTION',
    transactionID: 'transid1',
    data:
     { status: 'failed',
       message: 'invalid limit price "null" or shares "10"' } } ], `Didn't dispatch a failed UPDATE_EXISTING_TRANSACTION action object`);
	});

	it(`should fail gracefully if limitPrice and numShares are both null or both undefined`, () => {
		// transactionID, marketID, outcomeID, numShares, limitPrice, totalEthWithFee, tradingFeesEth, gasFeesRealEth
		store.dispatch(action.processAsk('transid1', 'testBinaryMarketID', '2', null, null, '0.1234', '0.1', '0.005'));
		assert.deepEqual(store.getActions(), [ { type: 'UPDATE_EXISTING_TRANSACTION',
    transactionID: 'transid1',
    data:
     { status: 'failed',
       message: 'invalid limit price "null" or shares "null"' } } ], `Didn't dispatch a failed UPDATE_EXISTING_TRANSACTION action object`);

		store.clearActions();

		store.dispatch(action.processAsk('transid1', 'testBinaryMarketID', '2', undefined, undefined, '0.1234', '0.1', '0.005'));
		assert.deepEqual(store.getActions(), [ { type: 'UPDATE_EXISTING_TRANSACTION',
    transactionID: 'transid1',
    data:
     { status: 'failed',
       message: 'invalid limit price "undefined" or shares "undefined"' } } ], `Didn't dispatch a failed UPDATE_EXISTING_TRANSACTION action object`);
	});

	it(`Should fail gracefully if marketID is undefined or null`, () => {
		// transactionID, marketID, outcomeID, numShares, limitPrice, totalEthWithFee, tradingFeesEth, gasFeesRealEth
		store.dispatch(action.processAsk('transid1', undefined, '2', '10', '0.5', '0.1234', '0.1', '0.005'));
		assert.deepEqual(store.getActions(), [ { type: 'UPDATE_EXISTING_TRANSACTION',
    transactionID: 'transid1',
    data:
     { status: 'failed',
       message: 'There was an issue processesing the ask trade.' } } ], `Didn't dispatch the failed transaction action object`);

		store.clearActions();
		store.dispatch(action.processAsk('transid1', null, '2', '10', '0.5', '0.1234', '0.1', '0.005'));
		assert.deepEqual(store.getActions(), [ { type: 'UPDATE_EXISTING_TRANSACTION',
    transactionID: 'transid1',
    data:
     { status: 'failed',
       message: 'There was an issue processesing the ask trade.' } } ], `Didn't dispatch the failed transaction action object`);
	});

	it(`Should fail gracefully if outcomeID is undefined or null`, () => {
		// transactionID, marketID, outcomeID, numShares, limitPrice, totalEthWithFee, tradingFeesEth, gasFeesRealEth
		store.dispatch(action.processAsk('transid1', 'testBinaryMarketID', undefined, '10', '0.5', '0.1234', '0.1', '0.005'));
		assert.deepEqual(store.getActions(), [ { type: 'UPDATE_EXISTING_TRANSACTION',
    transactionID: 'transid1',
    data:
     { status: 'failed',
       message: 'There was an issue processesing the ask trade.' } } ], `Didn't dispatch the failed transaction action object`);

		store.clearActions();
		store.dispatch(action.processAsk('transid1', 'testBinaryMarketID', null, '10', '0.5', '0.1234', '0.1', '0.005'));
		assert.deepEqual(store.getActions(), [ { type: 'UPDATE_EXISTING_TRANSACTION',
    transactionID: 'transid1',
    data:
     { status: 'failed',
       message: 'There was an issue processesing the ask trade.' } } ], `Didn't dispatch the failed transaction action object`);
	});

	it(`Should fail gracefully if totalEthWithFee is undefined or null`, () => {
		// transactionID, marketID, outcomeID, numShares, limitPrice, totalEthWithFee, tradingFeesEth, gasFeesRealEth
		store.dispatch(action.processAsk('transid1', 'testBinaryMarketID', '2', '10', '0.5', undefined, '0.1', '0.005'));
		assert.deepEqual(store.getActions(), [ { type: 'UPDATE_EXISTING_TRANSACTION',
    transactionID: 'transid1',
    data:
     { status: 'failed',
       message: 'There was an issue processesing the ask trade.' } } ], `Didn't dispatch the failed transaction action object`);

		store.clearActions();
		store.dispatch(action.processAsk('transid1', 'testBinaryMarketID', '2', '10', '0.5', null, '0.1', '0.005'));
		assert.deepEqual(store.getActions(), [ { type: 'UPDATE_EXISTING_TRANSACTION',
    transactionID: 'transid1',
    data:
     { status: 'failed',
       message: 'There was an issue processesing the ask trade.' } } ], `Didn't dispatch the failed transaction action object`);
	});

	it(`Should fail gracefully if tradingFeesEth is undefined or null`, () => {
		// transactionID, marketID, outcomeID, numShares, limitPrice, totalEthWithFee, tradingFeesEth, gasFeesRealEth
		store.dispatch(action.processAsk('transid1', 'testBinaryMarketID', '2', '10', '0.5', '0.1234', undefined, '0.005'));
		assert.deepEqual(store.getActions(), [ { type: 'UPDATE_EXISTING_TRANSACTION',
    transactionID: 'transid1',
    data:
     { status: 'failed',
       message: 'There was an issue processesing the ask trade.' } } ], `Didn't dispatch the failed transaction action object`);

		store.clearActions();
		store.dispatch(action.processAsk('transid1', 'testBinaryMarketID', '2', '10', '0.5', '0.1234', null, '0.005'));
		assert.deepEqual(store.getActions(), [ { type: 'UPDATE_EXISTING_TRANSACTION',
    transactionID: 'transid1',
    data:
     { status: 'failed',
       message: 'There was an issue processesing the ask trade.' } } ], `Didn't dispatch the failed transaction action object`);
	});

	it(`Should fail gracefully if gasFeesRealEth is undefined or null`, () => {
		// transactionID, marketID, outcomeID, numShares, limitPrice, totalEthWithFee, tradingFeesEth, gasFeesRealEth
		store.dispatch(action.processAsk('transid1', 'testBinaryMarketID', '2', '10', '0.5', '0.1234', '0.1', undefined));
		assert.deepEqual(store.getActions(), [ { type: 'UPDATE_EXISTING_TRANSACTION',
    transactionID: 'transid1',
    data:
     { status: 'failed',
       message: 'There was an issue processesing the ask trade.' } } ], `Didn't dispatch the failed transaction action object`);

		store.clearActions();
		store.dispatch(action.processAsk('transid1', 'testBinaryMarketID', '2', '10', '0.5', '0.1234', '0.1', null));
		assert.deepEqual(store.getActions(), [ { type: 'UPDATE_EXISTING_TRANSACTION',
    transactionID: 'transid1',
    data:
     { status: 'failed',
       message: 'There was an issue processesing the ask trade.' } } ], `Didn't dispatch the failed transaction action object`);
	});
});
