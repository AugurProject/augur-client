import { augur } from '../../../services/augurjs';
import {
	loadLoginAccountDependents,
	loadLoginAccountLocalStorage
} from '../../auth/actions/load-login-account';
import { updateLoginAccount } from '../../auth/actions/update-login-account';
import { authError } from '../../auth/actions/auth-error';

export function loginWithAirbitz(airbitzAccount) {
	return (dispatch, getState) => {
		const { links } = require('../../../selectors');

		// XXX use dataKey for now as the masterPrivateKey. For production, this will need to be a key
		// created and saved in a wallet repo inside the Augur account. -paul@airbitz.co
		const masterPrivateKey = airbitzAccount.repoInfo.dataKey;
		augur.web.loginWithMasterKey(airbitzAccount.username, masterPrivateKey, (account) => {
			console.log(account);
			if (!account) {
				return dispatch(authError({ code: 0, message: 'failed to login' }));
			} else if (account.error) {
				return dispatch(authError({ code: account.error, message: account.message }));
			}
			const loginAccount = { ...account, id: account.address, airbitzAccount };
			if (!loginAccount || !loginAccount.id) {
				return;
			}
			try {
				dispatch(loadLoginAccountLocalStorage(loginAccount.id));
				dispatch(updateLoginAccount(loginAccount));
				dispatch(loadLoginAccountDependents());
			} catch (e) {
				console.log('Error setting account login data');
			}
			if (links && links.marketsLink)	{
				links.marketsLink.onClick(links.marketsLink.href);
			}
		});
	};
}
