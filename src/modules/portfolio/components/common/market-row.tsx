import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import ToggleRow from "modules/portfolio/components/common/toggle-row.tsx";
import { MarketStatusLabel } from "modules/common-elements/labels";

import Styles from "modules/portfolio/components/common/market-row.styles";

// todo: MarketRow__time will end up being a passed in prop
// info toggle content will be passed in as a child
// maybe will have a boolean for whether it is extendable because the watchlist one is different

export interface TimeObject {
  formattedShortDate: string
}

export interface Market {
  marketId: string,
  description: string,
  marketStatus: string,
  creationTime: TimeObject
}

export interface MarketRowProps {
  market: Market,
  showState: boolean
}

const MarketRow = (props: MarketRowProps) => (
  <ToggleRow
    className={classNames(Styles.MarketRow, {[Styles.MarketRow__showState]: props.showState})}
    topRowContent={
      props.showState && (
        <div className={Styles.MarketRow__firstRow}>
          <MarketStatusLabel
            marketStatus={props.market.marketStatus}
            alternate
            mini
          />
        </div>
      )
    }
    rowContent={
      <div className={Styles.MarketRow__infoContainer}>
        <span className={Styles.MarketRow__description}>{props.market.description}</span>
        <span className={Styles.MarketRow__time}>{props.market.creationTime.formattedShortDate}</span>
      </div>
    }
    toggleContent={
      <div>
        info
      </div>
    }
/>);

export default MarketRow;