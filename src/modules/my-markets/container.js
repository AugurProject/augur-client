import { connect } from 'react-redux';

import MyMarkets from 'modules/my-markets/components/my-markets';
import getMyMarkets from 'modules/my-markets/selectors/my-markets';
import { loadAccountHistory } from 'modules/auth/actions/load-account-history';

const mapStateToProps = state => ({
  myMarkets: getMyMarkets(),
  transactionsLoading: state.transactionsLoading,
  hasAllTransactionsLoaded: state.transactionsOldestLoadedBlock === state.loginAccount.registerBlockNumber
});

const mapDispatchToProps = dispatch => ({
  loadMoreTransactions: () => dispatch(loadAccountHistory()),
  loadAllTransactions: () => dispatch(loadAccountHistory(true))
});

const MyMarketsContainer = connect(mapStateToProps, mapDispatchToProps)(MyMarkets);

export default MyMarketsContainer;
