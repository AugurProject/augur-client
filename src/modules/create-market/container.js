import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { submitNewMarket } from 'modules/create-market/actions/submit-new-market';
import {
  addValidationToNewMarket,
  removeValidationFromNewMarket,
  addOrderToNewMarket,
  removeOrderFromNewMarket,
  updateNewMarket,
  clearNewMarket
} from 'modules/create-market/actions/update-new-market';
import CreateMarketView from 'modules/create-market/components/create-market-view';

import getValue from 'utils/get-value';

const mapStateToProps = state => ({
  branch: state.branch,
  availableEth: getValue(state, 'loginAccount.ethTokens'),
  newMarket: state.newMarket,
  footerHeight: state.footerHeight
});

const mapDispatchToProps = dispatch => ({
  addValidationToNewMarket: data => dispatch(addValidationToNewMarket(data)),
  removeValidationFromNewMarket: data => dispatch(removeValidationFromNewMarket(data)),
  addOrderToNewMarket: data => dispatch(addOrderToNewMarket(data)),
  removeOrderFromNewMarket: data => dispatch(removeOrderFromNewMarket(data)),
  updateNewMarket: data => dispatch(updateNewMarket(data)),
  clearNewMarket: () => dispatch(clearNewMarket()),
  submitNewMarket: (data, history) => dispatch(submitNewMarket(data, history))
});

const CreateMarket = withRouter(connect(mapStateToProps, mapDispatchToProps)(CreateMarketView));

export default CreateMarket;
