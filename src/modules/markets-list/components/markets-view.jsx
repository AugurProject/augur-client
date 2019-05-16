import React, { Component } from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";

import MarketsHeader from "modules/markets-list/components/markets-header/markets-header";
import MarketsList from "modules/markets-list/components/markets-list";
import { TYPE_TRADE } from "modules/markets/constants/link-types";

export default class MarketsView extends Component {
  static propTypes = {
    isLogged: PropTypes.bool.isRequired,
    markets: PropTypes.array.isRequired,
    hasPositionsInCutoffMarkets: PropTypes.bool.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    toggleFavorite: PropTypes.func.isRequired,
    loadMarketsInfoIfNotLoaded: PropTypes.func.isRequired,
    isMobile: PropTypes.bool.isRequired,
    loadMarketsByFilter: PropTypes.func.isRequired,
    search: PropTypes.string,
    category: PropTypes.string,
    universe: PropTypes.string,
    defaultFilter: PropTypes.string.isRequired,
    defaultSort: PropTypes.string.isRequired,
    defaultMaxFee: PropTypes.string.isRequired,
    defaultMaxSpread: PropTypes.string.isRequired,
    defaultHidePastCutoff: PropTypes.bool.isRequired,
    defaultExperimentalInvalid: PropTypes.bool.isRequired,
    loadDisputing: PropTypes.func.isRequired
  };

  static defaultProps = {
    search: null,
    category: null,
    universe: null
  };

  constructor(props) {
    super(props);

    this.state = {
      filter: props.defaultFilter,
      sort: props.defaultSort,
      maxFee: props.defaultMaxFee,
      maxSpreadPercent: props.defaultMaxSpread,
      hidePostV2Markets: props.defaultHidePastCutoff,
      experimentalInvalid: props.defaultExperimentalInvalid,
      filterSortedMarkets: []
    };

    this.updateFilter = this.updateFilter.bind(this);
    this.updateFilteredMarkets = this.updateFilteredMarkets.bind(this);
  }

  componentDidMount() {
    const { universe, loadDisputing } = this.props;
    if (universe) {
      this.updateFilteredMarkets();
      loadDisputing();
    }
  }

  componentDidUpdate(prevProps) {
    const { search, category, universe } = this.props;
    if (
      universe !== prevProps.universe ||
      (search !== prevProps.search || category !== prevProps.category)
    ) {
      this.updateFilteredMarkets();
    }
  }

  updateFilter(params) {
    const {
      filter,
      sort,
      maxFee,
      maxSpreadPercent,
      hidePostV2Markets,
      experimentalInvalid
    } = params;
    this.setState(
      {
        filter,
        sort,
        maxFee,
        maxSpreadPercent,
        hidePostV2Markets,
        experimentalInvalid
      },
      this.updateFilteredMarkets
    );
  }

  updateFilteredMarkets() {
    const { search, category, loadMarketsByFilter } = this.props;
    const {
      filter,
      sort,
      maxFee,
      maxSpreadPercent,
      hidePostV2Markets,
      experimentalInvalid
    } = this.state;
    loadMarketsByFilter(
      {
        category,
        search,
        filter,
        sort,
        maxFee,
        maxSpreadPercent,
        hidePostV2Markets,
        experimentalInvalid
      },
      (err, filterSortedMarkets) => {
        if (err) return console.log("Error loadMarketsFilter:", err);
        if (this.componentWrapper) this.setState({ filterSortedMarkets });
      }
    );
  }

  render() {
    const {
      history,
      isLogged,
      isMobile,
      loadMarketsInfoIfNotLoaded,
      location,
      markets,
      toggleFavorite,
      hasPositionsInCutoffMarkets
    } = this.props;
    const {
      filter,
      sort,
      maxFee,
      maxSpreadPercent,
      hidePostV2Markets,
      experimentalInvalid,
      filterSortedMarkets
    } = this.state;

    return (
      <section
        ref={componentWrapper => {
          this.componentWrapper = componentWrapper;
        }}
      >
        <Helmet>
          <title>Markets</title>
        </Helmet>
        <MarketsHeader
          isLogged={isLogged}
          location={location}
          markets={markets}
          filter={filter}
          sort={sort}
          maxFee={maxFee}
          maxSpreadPercent={maxSpreadPercent}
          hidePostV2Markets={hidePostV2Markets}
          experimentalInvalid={experimentalInvalid}
          updateFilter={this.updateFilter}
          history={history}
          hasPositionsInCutoffMarkets={hasPositionsInCutoffMarkets}
        />
        <MarketsList
          testid="markets"
          isLogged={isLogged}
          markets={markets}
          filteredMarkets={filterSortedMarkets}
          location={location}
          history={history}
          toggleFavorite={toggleFavorite}
          loadMarketsInfoIfNotLoaded={loadMarketsInfoIfNotLoaded}
          linkType={TYPE_TRADE}
          isMobile={isMobile}
        />
      </section>
    );
  }
}
