import { connect } from 'react-redux'

import ReportingHeader from 'modules/reporting/components/reporting-header/reporting-header'

import { loadReportingWindowBounds } from 'modules/reporting/actions/load-reporting-window-bounds'

import { updateModal } from 'modules/modal/actions/update-modal'

const mapStateToProps = state => ({
  reportingWindowStats: state.reportingWindowStats,
  isMobile: state.isMobile,
  repBalance: state.loginAccount.rep || '0',
  forkingMarket: state.universe.forkingMarket,
  currentTime: state.blockchain.currentAugurTimestamp,
  doesUserHaveRep: state.loginAccount.rep > 0,
})

const mapDispatchToProps = dispatch => ({
  loadReportingWindowStake: () => { /* TODO */ },
  loadReportingWindowBounds: () => dispatch(loadReportingWindowBounds()),
  updateModal: modal => dispatch(updateModal(modal)),
})

const mergeProps = (sP, dP, oP) => ({
  ...oP,
  ...sP,
  ...dP,
})

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(ReportingHeader)
