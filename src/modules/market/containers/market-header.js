import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

import MarketHeader from "modules/market/components/market-header/market-header";
import { ZERO } from "modules/trade/constants/numbers";
import { selectMarket } from "modules/market/selectors/market";
import { selectCurrentTimestamp } from "src/select-state";

const mapStateToProps = (state, ownProps) => {
  const market = selectMarket(ownProps.marketId);

  return {
    description: market.description || "",
    details: market.details || "",
    marketType: market.marketType,
    maxPrice: market.maxPrice || ZERO,
    minPrice: market.minPrice || ZERO,
    scalarDenomination: market.scalarDenomination,
    resolutionSource: market.resolutionSource,
    currentTimestamp: selectCurrentTimestamp(state) || 0,
    market
  };
};

const MarketHeaderContainer = withRouter(
  connect(mapStateToProps)(MarketHeader)
);

export default MarketHeaderContainer;
