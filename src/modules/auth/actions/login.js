import { augur } from 'services/augurjs';
import { base58Decode } from 'utils/base-58';
import { loadAccountData } from 'modules/auth/actions/load-account-data';
import { updateIsLoggedIn } from 'modules/auth/actions/update-is-logged-in';
import logError from 'utils/log-error';

export const login = (loginID, password, callback = logError) => (dispatch, getState) => {
  const accountObject = base58Decode(loginID);
  if (!accountObject || !accountObject.keystore) {
    return callback({ code: 0, message: 'could not decode login ID' });
  }
  augur.accounts.login(accountObject.keystore, password, (account) => {
    if (!account) {
      return callback({ code: 0, message: 'failed to login' });
    } else if (account.error) {
      return callback({ code: account.error, message: account.message });
    } else if (!account.address) {
      return callback(account);
    }
    dispatch(updateIsLoggedIn(true));
    dispatch(loadAccountData({ ...account, loginID, name: accountObject.name }, true));
    callback(null);
  });
};
