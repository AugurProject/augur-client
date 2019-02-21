import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import ToggleRow from "modules/portfolio/components/common/rows/toggle-row.tsx";
import { MarketStatusLabel } from "modules/common-elements/labels";
import MarketLink from "modules/market/components/market-link/market-link";
import { LinearPropertyLabel } from "modules/common-elements/labels";
import Styles from "modules/portfolio/components/common/rows/market-row.styles";

// todo: MarketRow__time will end up being a passed in prop
// info toggle content will be passed in as a child
// maybe will have a boolean for whether it is extendable because the watchlist one is different

export interface TimeObject {
  formattedShortDate: string;
}
export interface FormatObject {
  formatted: string;
}

export interface Market {
  marketId: string;
  description: string;
  marketStatus: string;
  creationTime: TimeObject;
  volume: FormatObject;
  openInterest: FormatObject;
}

export interface MarketRowProps {
  market: Market;
  showState: boolean;
}

const MarketRow = (props: MarketRowProps) => (
  <ToggleRow
    className={classNames(Styles.MarketRow, {
      [Styles.MarketRow__showState]: props.showState
    })}
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
      <div className={Styles.MarketRow__rowContainer}>
          <MarketLink id={props.market.marketId} className="market-link">
            {props.market.description}
          </MarketLink>
        <span className={Styles.MarketRow__description}>
          {props.market.description}
        </span>
        <span className={Styles.MarketRow__time}>
          {props.market.creationTime.formattedShortDate}
        </span>
      </div>
    }
    toggleContent={
      <div className={Styles.MarketRow__infoContainer}>
        <div>
          <LinearPropertyLabel
            label="Volume"
            value={`${props.market.volume.formatted} ETH`}
          />
          <LinearPropertyLabel
            label="Open Interest"
            value={`${props.market.openInterest.formatted} ETH`}
          />
        </div>
      </div>
    }
  />
);

export default MarketRow;
