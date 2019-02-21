/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */ // needed because <button> cannot take the place <ul> in the table structure
/* eslint react/no-array-index-key: 0 */

import PropTypes from "prop-types";
import React, { Component } from "react";
import classNames from "classnames";

import getValue from "utils/get-value";
import { SELL, BOUGHT, SOLD } from "modules/common-elements/constants";
import ChevronFlip from "modules/common/components/chevron-flip/chevron-flip";
import EtherscanLink from "modules/common/containers/etherscan-link";
import { formatEther, formatShares } from "utils/format-number";

import SharedStyles from "modules/market/components/market-positions-table/market-positions-table--position.styles";
import Styles from "modules/market/components/market-orders-positions-table/filled-orders-table--orders.styles";
import TableStyles from "modules/market/components/market-orders-positions-table/open-orders-table.style";

export default class FilledOrdersOrder extends Component {
  static propTypes = {
    isMobile: PropTypes.bool.isRequired,
    order: PropTypes.shape({
      type: PropTypes.string.isRequired,
      timestamp: PropTypes.object.isRequired,
      price: PropTypes.object.isRequired,
      outcome: PropTypes.any,
      trades: PropTypes.array.isRequired
    }).isRequired,
    oddNumber: PropTypes.bool,
    scalarDenomination: PropTypes.string
  };

  static defaultProps = {
    oddNumber: false,
    scalarDenomination: ""
  };

  constructor(props) {
    super(props);

    this.state = {
      showTrades: false
    };

    this.setShowTrades = this.setShowTrades.bind(this);
  }

  setShowTrades() {
    this.setState({ showTrades: !this.state.showTrades });
  }

  render() {
    const { isMobile, order, oddNumber, scalarDenomination } = this.props;

    const s = this.state;

    const orderQuantity = formatShares(getValue(order, "amount")).formatted;
    const orderPrice = formatEther(getValue(order, "price")).formatted;
    const orderType = getValue(order, "type");
    const orderDisplay = orderType !== SELL ? BOUGHT : SOLD;

    return (
      <div
        className={classNames(Styles.FilledOrder__container, {
          [SharedStyles.TableItemDark]: oddNumber
        })}
      >
        <ul
          ref={order => {
            this.order = order;
          }}
          className={classNames(SharedStyles.Order, Styles.FilledOrder, {
            [Styles.FilledOrder__active]: s.showTrades,
            [SharedStyles.Negative]: orderType === SELL
          })}
          onClick={this.setShowTrades}
        >
          <li>{order.outcome || scalarDenomination}</li>
          <li
            className={classNames(SharedStyles.Order__type, {
              [SharedStyles.Order__typeSell]: orderType === SELL
            })}
            style={{ textTransform: "capitalize" }}
          >
            {orderDisplay}
          </li>
          <li>{orderQuantity}</li>
          <li>{orderPrice}</li>
          <li>{order.timestamp.formattedShortDate}</li>
          <li>
            {order.trades.length}
            <ChevronFlip
              className={Styles.FilledOrder__chevron}
              pointDown={!s.showTrades}
            />
          </li>
        </ul>
        {s.showTrades && (
          <div className={TableStyles.MarketOpenOrdersList__table}>
            <ul
              className={classNames(
                TableStyles["MarketOpenOrdersList__table-header"],
                Styles["FilledOrder__table-header"]
              )}
            >
              {!isMobile && <li />}
              <li>Filled</li>
              <li>Time Stamp</li>
              <li>Transaction Details</li>
            </ul>
            {order.trades.length > 0 && (
              <div
                className={classNames(
                  TableStyles["MarketOpenOrdersList__table-body"],
                  Styles.FilledOrder__tradeBody
                )}
              >
                {order.trades.map((trade, i) => (
                  <ul
                    key={i}
                    className={classNames(
                      SharedStyles.FilledOrder,
                      Styles.FilledOrder__trade
                    )}
                  >
                    {!isMobile && <li />}
                    <li>{formatShares(trade.amount).formatted}</li>
                    <li>{trade.timestamp.formatted}</li>
                    <li>
                      <button
                        className={Styles.FilledOrder__view}
                        onClick={null}
                      >
                        <EtherscanLink
                          showNonLink
                          txhash={trade.transactionHash}
                          label={
                            isMobile ? "Details" : "View Transaction Details"
                          }
                        />
                      </button>
                    </li>
                  </ul>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}
