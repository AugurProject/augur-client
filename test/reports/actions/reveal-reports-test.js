import { describe, it, beforeEach } from 'mocha';
import {
	assert
} from 'chai';
import proxyquire from 'proxyquire';
import sinon from 'sinon';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import testState from 'test/testState';

describe('modules/reports/actions/reveal-reports.js', () => {
	proxyquire.noPreserveCache().noCallThru();
	const middlewares = [thunk];
	const mockStore = configureMockStore(middlewares);
	const reports = {
		[testState.branch.id]: {
			test1: {
				eventID: 'test1',
				marketID: 'market1',
				reportHash: '0xtesthash123456789testhash1',
				salt: 'salt1',
				period: 19,
				isRevealed: false,
				reportedOutcomeID: 'testOutcomeID1',
				minValue: '1',
				maxValue: '2',
				isUnethical: false,
				isIndeterminate: true,
				isCategorical: false,
				isScalar: false
			},
			test2: {
				eventID: 'test2',
				marketID: 'market2',
				reportHash: '0xtesthash123456789testhash2',
				salt: 'salt2',
				period: 19,
				isRevealed: false,
				reportedOutcomeID: 'testOutcomeID2',
				minValue: '5',
				maxValue: '20',
				isUnethical: false,
				isIndeterminate: false,
				isCategorical: false,
				isScalar: true
			},
			test3: {
				eventID: 'test3',
				marketID: 'market3',
				reportHash: '0xtesthash123456789testhash3',
				salt: 'salt3',
				period: 19,
				isRevealed: false,
				reportedOutcomeID: 'testOutcomeID3',
				minValue: '1',
				maxValue: '2',
				isUnethical: true,
				isIndeterminate: false,
				isCategorical: false,
				isScalar: false
			}
		}
	};
	const state = Object.assign({}, testState, {
		loginAccount: {
			...testState.loginAccount,
			ether: 100,
			rep: 100,
			realEther: 100
		},
		reports
	});
	const store = mockStore(state);

	const mockAddRevealReportTransaction = { addRevealReportTransaction: () => {} };
	sinon.stub(mockAddRevealReportTransaction, 'addRevealReportTransaction', (eventID, marketID, reportedOutcomeID, salt, minValue, maxValue, type, isUnethical, isIndeterminate, callback) => (dispatch, getState) => {
		callback(null);
	});

	const action = proxyquire('../../../src/modules/reports/actions/reveal-reports.js', {
		'../../transactions/actions/add-reveal-report-transaction': mockAddRevealReportTransaction
	});

	beforeEach(() => {
		store.clearActions();
	});

	it('should reveal reports', () => {
		const out = [{
			type: 'UPDATE_REPORTS',
			reports: {
				[testState.branch.id]: {
					test1: {
						...reports[testState.branch.id].test1,
						isRevealed: true
					}
				}
			}
		}];
		store.dispatch(action.revealReports());
		assert.deepEqual(store.getActions(), out, `Didn't dispatch the expected action objects`);
		assert(mockAddRevealReportTransaction.addRevealReportTransaction.calledOnce, `Didn't call addRevealReportTransaction once as expected`);
	});

});
