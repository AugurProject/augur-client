import * as AugurJS from '../../../services/augurjs';

import { SUCCESS, FAILED, INTERRUPTED } from '../../transactions/constants/statuses';

import { updateLoginAccount } from '../../auth/actions/update-login-account';
import { updateAssets } from '../../auth/actions/update-assets';
import { clearAccountTrades } from '../../my-positions/actions/clear-account-trades';
import { loadAccountTrades } from '../../my-positions/actions/load-account-trades';
import { updateReports, clearReports } from '../../reports/actions/update-reports';
import { syncBranch } from '../../app/actions/update-branch';
import { updateFavorites } from '../../markets/actions/update-favorites';
import { updateAccountTradesData } from '../../../modules/my-positions/actions/update-account-trades-data';
import { updateTransactionsData } from '../../transactions/actions/update-transactions-data';
import { loadEventsWithSubmittedReport } from '../../my-reports/actions/load-events-with-submitted-report';
import updateUserLoginMessageVersionRead from '../../login-message/actions/update-user-login-message-version-read';
import { updateAccountSettings } from '../../auth/actions/update-account-settings';
import { updateScalarMarketShareDenomination } from '../../market/actions/update-scalar-market-share-denomination';

export function loadLoginAccountDependents(cb) {
	return (dispatch, getState) => {
		const { loginAccount } = getState();
		dispatch(updateAssets(cb));
		AugurJS.augur.getRegisterBlockNumber(loginAccount.address, (err, blockNumber) => {
			if (!err && blockNumber) {
				loginAccount.registerBlockNumber = blockNumber;
				dispatch(updateLoginAccount(loginAccount));
			}
			dispatch(clearAccountTrades());
			dispatch(loadAccountTrades());

			// clear and load reports for any markets that have been loaded
			// (partly to handle signing out of one account and into another)
			dispatch(clearReports());
			dispatch(syncBranch((err) => {
				if (err) console.error('syncBranch:', err);
				dispatch(loadEventsWithSubmittedReport());
			}));
		});
	};
}

export function loadLoginAccountLocalStorage(accountID) {
	return (dispatch) => {
		const localStorageRef = typeof window !== 'undefined' && window.localStorage;

		if (!localStorageRef || !localStorageRef.getItem || !accountID) {
			return;
		}

		const localState = JSON.parse(localStorageRef.getItem(accountID));

		if (!localState) {
			return;
		}

		if (localState.favorites) {
			dispatch(updateFavorites(localState.favorites));
		}
		if (localState.scalarMarketsShareDenomination) {
			Object.keys(localState.scalarMarketsShareDenomination).forEach((marketID) => {
				dispatch(updateScalarMarketShareDenomination(marketID, localState.scalarMarketsShareDenomination[marketID]));
			});
		}
		if (localState.accountTrades) {
			dispatch(clearAccountTrades());
			dispatch(updateAccountTradesData(localState.accountTrades));
		}
		if (localState.reports && Object.keys(localState.reports).length) {
			dispatch(updateReports(localState.reports));
		}
		if (localState.transactionsData) {
			Object.keys(localState.transactionsData).forEach((key) => {
				if ([SUCCESS, FAILED, INTERRUPTED].indexOf(localState.transactionsData[key].status) < 0) {
					localState.transactionsData[key].status = INTERRUPTED;
					localState.transactionsData[key].message = 'unknown if completed';
				}
			});
			dispatch(updateTransactionsData(localState.transactionsData));
		}
		if (localState.settings) {
			dispatch(updateAccountSettings(localState.settings));
		}

		if (localState.loginMessageVersionRead && !isNaN(parseInt(localState.loginMessageVersionRead, 10))) {
			dispatch(updateUserLoginMessageVersionRead(parseInt(localState.loginMessageVersionRead, 10)));
		}
	};
}

export function loadLoginAccount() {
	return (dispatch, getState) => {
		const localStorageRef = typeof window !== 'undefined' && window.localStorage;
		const { env } = getState();

		AugurJS.loadLoginAccount(env, (err, loginAccount) => {
			let localLoginAccount = loginAccount;

			if (err) {
				return console.error('ERR loadLoginAccount():', err);
			}

			if (!localLoginAccount && localStorageRef && localStorageRef.getItem) {
				const account = localStorageRef.getItem('account');
				if (account !== null) {
					localLoginAccount = JSON.parse(account);
				}
			}

			if (!localLoginAccount || !localLoginAccount.address) {
				return;
			}
			localLoginAccount.onUpdateAccountSettings = settings => dispatch(updateAccountSettings(settings));

			dispatch(loadLoginAccountLocalStorage(localLoginAccount.address));
			dispatch(updateLoginAccount(localLoginAccount));
			dispatch(loadLoginAccountDependents());

		});
	};
}
