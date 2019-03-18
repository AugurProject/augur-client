import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Message } from "modules/modal/message";

import { closeModal } from "modules/modal/actions/close-modal";

const mapStateToProps = (state: any) => ({
  modal: state.modal,
  address: state.loginAccount.displayAddress
});

const mapDispatchToProps = (dispatch: Function) => ({
  closeModal: () => dispatch(closeModal())
});

const mergeProps = (sP: any, dP: any, oP: any) => ({
  title: "Receive Funds",
  description: [
    "To trade, send Ethereum (ETH) or Reputation (REP) to the wallet you use to connect to Augur."
  ],
  closeAction: () => dP.closeModal(),
  readableAddress: {
    address: sP.address,
    showQR: true,
    copyable: true,
    title: "Your connected wallet address"
  },
  buttons: []
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
  )(Message)
);
