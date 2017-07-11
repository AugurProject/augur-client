import { connect } from 'react-redux';
import TransactionsView from 'modules/transactions/components/transactions-view';

import { selectTransactions } from 'modules/transactions/selectors/transactions';
import { selectLoginAccount } from 'modules/auth/selectors/login-account';
import { loadAccountHistory } from 'modules/auth/actions/load-account-history';
import { triggerTransactionsExport } from 'modules/transactions/actions/trigger-transactions-export';

const mapStateToProps = state => ({
  branch: state.branch,
  currentBlockNumber: state.blockchain.currentBlockNumber,
  loginAccount: selectLoginAccount(state),
  transactions: selectTransactions(state),
  transactionsLoading: state.transactionsLoading,
  hasAllTransactionsLoaded: state.transactionsOldestLoadedBlock === state.loginAccount.registerBlockNumber,
  isMobile: state.isMobile
});

const mapDispatchToProps = dispatch => ({
  loadMoreTransactions: () => dispatch(loadAccountHistory()),
  loadAllTransactions: () => dispatch(loadAccountHistory(true)),
  triggerTransactionsExport: () => dispatch(triggerTransactionsExport()),
});

const Transactions = connect(mapStateToProps, mapDispatchToProps)(TransactionsView);

export default Transactions;
