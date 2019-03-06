import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

import { selectMarket } from "modules/markets/selectors/market";
import { sellCompleteSets } from "modules/positions/actions/sell-complete-sets";
import MarketPositionsList from "modules/market/components/market-positions-table/market-positions-table";
import { updateModal } from "modules/modal/actions/update-modal";
import {
  MODAL_SELL_COMPLETE_SETS
} from "modules/common-elements/constants";



const mapStateToProps = (state: any, ownProps: any) => {
  const market = selectMarket(ownProps.marketId);

  const positions = market.userPositions || [];

  return {
    positions,
    numCompleteSets:
      (market.myPositionsSummary &&
        market.myPositionsSummary.numCompleteSets) ||
      undefined,
    transactionsStatus: state.transactionsStatus,
    isMobile: state.appStatus.isMobile
  }
}

const mapDispatchToProps = (dispatch: Function) => ({
  sellCompleteSets: (marketId: string, numCompleteSets: any, cb: Function) =>
    dispatch(updateModal({
      type: MODAL_SELL_COMPLETE_SETS,
      marketId,
      numCompleteSets,
      cb
    }))
});

const PositionsTable = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(MarketPositionsList)
);

export default PositionsTable;