import { augur } from 'services/augurjs';
import { base58Decode, base58Encode } from 'utils/base-58';
import { loadAccountData } from 'modules/auth/actions/load-account-data';
import { updateIsLoggedIn } from 'modules/auth/actions/update-is-logged-in';
import logError from 'utils/log-error';

export const register = (password, callback = logError) => dispatch => (
  augur.accounts.register(password, (account) => {
    if (!account || !account.address) {
      return callback({ code: 0, message: 'failed to register' });
    } else if (account.error) {
      return callback({ code: account.error, message: account.message });
    }
    dispatch(updateIsLoggedIn(true));
    callback(null, base58Encode(account));
  })
);

export const setupAndFundNewAccount = (password, loginID, callback = logError) => (dispatch, getState) => {
  if (!loginID) return callback({ message: 'loginID is required' });
  dispatch(loadAccountData({ loginID, ...base58Decode(loginID) }, true));
  callback(null);
};
