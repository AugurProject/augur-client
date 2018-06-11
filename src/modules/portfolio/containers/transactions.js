import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import { selectCurrentTimestamp } from 'src/select-state'
import { loadAccountHistory } from 'modules/auth/actions/load-account-history'
import { selectTransactions } from 'modules/transactions/selectors/transactions'
import TransactionsList from 'modules/portfolio/components/transactions/transactions'
import { updateTransactionPeriod } from 'modules/portfolio/actions/update-transaction-period'

const mapStateToProps = state => ({
  currentTimestamp: selectCurrentTimestamp(state),
  transactions: selectTransactions(state),
  transactionsLoading: state.transactionsLoading,
  transactionPeriod: state.transactionPeriod,
})

const mapDispatchToProps = dispatch => ({
  loadAccountHistoryTransactions: (beginTime, endTime) => dispatch(loadAccountHistory(beginTime, endTime)),
  updateTransactionPeriod: transactionPeriod => dispatch(updateTransactionPeriod(transactionPeriod)),
})

const Transactions = withRouter(connect(mapStateToProps, mapDispatchToProps)(TransactionsList))

export default Transactions
