import React, { Component } from "react";
import PropTypes from "prop-types";

// import PositionsMarketsList from "modules/portfolio/components/positions-markets-list/positions-markets-list";
import FilterSwitchBox from "modules/portfolio/components/common/filter-switch-box";
import MarketRow from "modules/portfolio/components/common/market-row";

const sortByOptions = [
  {
    label: "View by Market",
    value: "creationTime",
    comp: null
  },
  {
    label: "View by Outcome",
    value: "endTime",
    comp: null
  }
];

export default class FilledOrders extends Component {
  static propTypes = {
    markets: PropTypes.array.isRequired,
    filledOrders: PropTypes.array.isRequired,
    loadAccountTrades: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      filteredData: props.markets,
      viewByMarkets: true
    };

    this.updateFilteredData = this.updateFilteredData.bind(this);
    this.filterComp = this.filterComp.bind(this);
    this.switchView = this.switchView.bind(this);
  }

  componentWillMount() {
    const { loadAccountTrades } = this.props;
    loadAccountTrades();
  }

  updateFilteredData(filteredData) {
    this.setState({ filteredData });
  }

  filterComp(input, data) {
    if (this.state.viewByMarkets) {
      return data.description.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    }
    return (
      data.name && data.name.toLowerCase().indexOf(input.toLowerCase()) >= 0
    );
  }

  switchView() {
    this.setState({
      filteredData: this.state.viewByMarkets
        ? this.props.filledOrders
        : this.props.markets,
      viewByMarkets: !this.state.viewByMarkets
    });
  }

  render() {
    const { markets, filledOrders } = this.props;
    const { filteredData, viewByMarkets } = this.state;

    return (
      <FilterSwitchBox
        title="Filled Orders"
        showFilterSearch
        sortByOptions={sortByOptions}
        updateFilteredData={this.updateFilteredData}
        data={viewByMarkets ? markets : filledOrders}
        filterComp={this.filterComp}
        switchView={this.switchView}
        rows={
          <div>
            {filteredData.map(
              data =>
                viewByMarkets ? (
                  <MarketRow key={"filledOrder_" + data.id} market={data} />
                ) : (
                  <div>
                    {data.name} {data.buy}
                  </div>
                )
            )}
          </div>
        }
      />
    );
  }
}
