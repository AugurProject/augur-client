/* eslint-disable jsx-a11y/no-static-element-interactions */ // needed because <button> cannot take the place <ul> in the table structure

import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import { RightChevron } from "modules/common/components/icons";

import getValue from "utils/get-value";
import MarketOutcomeTradingIndicator from "modules/market/containers/market-outcome-trading-indicator";
import Styles from "modules/market/components/market-outcomes-list--outcome/market-outcomes-list--outcome.styles";
import SharedStyles from "modules/market/components/market-positions-table/market-positions-table--position.styles";
import { ValueLabel } from "modules/common-elements/labels";

const Outcome = ({
  outcome,
  selectedOutcome,
  updateSelectedOutcome,
  scalarDenomination,
  isMobile
}) => {
  const outcomeName = getValue(outcome, "name");

  const topBidShares = getValue(outcome, "topBid.shares");
  const topAskShares = getValue(outcome, "topAsk.shares");

  const topBidPrice = getValue(outcome, "topBid.price");
  const topAskPrice = getValue(outcome, "topAsk.price");

  const lastPrice = getValue(outcome, "lastPrice");
  const lastPricePercent = getValue(outcome, "lastPricePercent.full");

  return (
    <ul
      className={classNames(
        SharedStyles.Outcome,
        Styles.Outcome,
        Styles[`Outcome-${outcome.id}`],
        {
          [`${Styles.active}`]: selectedOutcome === outcome.id
        }
      )}
      onClick={e => updateSelectedOutcome(outcome.id)}
      role="menu"
    >
      <li>
        <div>
          <span className={Styles.Outcome__name}>
            {outcomeName || (scalarDenomination && scalarDenomination)}{" "}
          </span>
        </div>
        { scalarDenomination ? null :
          <div>
            <span className={Styles.Outcome__percent}>{lastPricePercent}</span>
          </div>
        }
      </li>
      <li>
        <ValueLabel value={topBidShares} />
      </li>
      <li>
        <ValueLabel value={topBidPrice} />
      </li>
      <li>
        <ValueLabel value={topAskPrice} />
      </li>
      <li>
        <ValueLabel value={topAskShares} />
      </li>
      <li style={{ position: "relative" }}>
        <ValueLabel value={lastPrice} />
        <MarketOutcomeTradingIndicator
          outcome={outcome}
          location="tradingPage"
          style={isMobile ? { bottom: "32%" } : null}
        />
      </li>
      {isMobile && <div>{RightChevron}</div>}
    </ul>
  );
};

Outcome.propTypes = {
  outcome: PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.string,
    topBid: PropTypes.shape({
      shares: PropTypes.object,
      price: PropTypes.object
    }),
    topAsk: PropTypes.shape({
      shares: PropTypes.object,
      price: PropTypes.object
    }),
    lastPrice: PropTypes.object,
    lastPricePercent: PropTypes.object
  }).isRequired,
  selectedOutcome: PropTypes.string,
  updateSelectedOutcome: PropTypes.func.isRequired,
  scalarDenomination: PropTypes.any,
  isMobile: PropTypes.bool
};

Outcome.defaultProps = {
  selectedOutcome: null,
  scalarDenomination: null,
  isMobile: false
};

export default Outcome;
