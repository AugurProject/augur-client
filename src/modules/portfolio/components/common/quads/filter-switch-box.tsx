import React, { ReactNode } from "react";

import QuadBox from "modules/portfolio/components/common/quads/quad-box";
import { NameValuePair, Market } from "modules/portfolio/types";
import EmptyDisplay from "modules/portfolio/components/common/tables/empty-display";

export interface MarketsByReportingState {
  [type: string]: Array<Market>;
}

export interface FilterBoxProps {
  title: string;
  bottomBarContent?: ReactNode;
  sortByOptions: Array<NameValuePair>;
  data: Array<Market>;
  filterComp: Function;
  showFilterSearch?: Boolean;
  switchView: Function;
  noSwitch?: Boolean;
  renderRows: Function;
  filterLabel: String;
  sortByStyles?: Object;
}

interface FilterBoxState {
  search: string;
}

export default class FilterSwitchBox extends React.Component<
  FilterBoxProps,
  FilterBoxState
> {
  state: FilterBoxState = {
    search: "",
    filteredData: this.props.data
  };

  componentDidMount() {
    const filteredData = this.applySearch(this.state.search, this.props.data);
    this.updateFilteredData(filteredData);
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.data.length !== this.props.data.length) {
      const filteredData = this.applySearch(nextState.search, nextProps.data);
      this.updateFilteredData(filteredData);
    }
  }

  onSearchChange = (input: string) => {
    this.setState({ search: input });

    const { data } = this.props;
    const filteredData = this.applySearch(input, data);

    this.updateFilteredData(filteredData);
  };

  applySearch = (input: string, filteredData: Array<Market>) => {
    const { filterComp } = this.props;

    return filteredData.filter(filterComp.bind(this, input));
  };

  updateView = () => {
    this.props.switchView();
  };

  updateFilteredData = filteredData => {
    this.setState({ filteredData });
  };

  render() {
    const {
      title,
      bottomBarContent,
      sortByOptions,
      showFilterSearch,
      noSwitch,
      isMobile,
      renderRows,
      filterLabel,
      sortByStyles
    } = this.props;

    const { search, filteredData } = this.state;

    return (
      <QuadBox
        title={title}
        showFilterSearch={showFilterSearch}
        search={search}
        onSearchChange={this.onSearchChange}
        sortByOptions={sortByOptions}
        sortByStyles={sortByStyles}
        updateDropdown={!noSwitch && this.updateView}
        bottomBarContent={bottomBarContent}
        content={
          <>
            {filteredData.length === 0 && (
              <EmptyDisplay
                selectedTab=""
                filterLabel={filterLabel}
                search={search}
              />
            )}
            {filteredData.length > 0 &&
              filteredData.map(data => renderRows(data))}
          </>
        }
        isMobile={isMobile}
      />
    );
  }
}
