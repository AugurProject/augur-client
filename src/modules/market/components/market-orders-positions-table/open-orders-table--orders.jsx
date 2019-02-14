/* eslint-disable jsx-a11y/no-static-element-interactions */ // needed because <button> cannot take the place <ul> in the table structure

import PropTypes from "prop-types";
import React, { Component } from "react";
import classNames from "classnames";

import { threeDots } from "modules/common/components/icons";
import getValue from "utils/get-value";
import { SELL } from "modules/common-elements/constants";

import SharedStyles from "modules/market/components/market-positions-table/market-positions-table--position.styles";
import Styles from "modules/market/components/market-orders-positions-table/open-orders-table--orders.style";

export default class OpenOrdersOrder extends Component {
  static propTypes = {
    isExtendedDisplay: PropTypes.bool.isRequired,
    isMobile: PropTypes.bool.isRequired,
    order: PropTypes.shape({
      name: PropTypes.string.isRequired,
      pending: PropTypes.bool,
      type: PropTypes.string.isRequired,
      orderCancellationStatus: PropTypes.string,
      avgPrice: PropTypes.object,
      unmatchedShares: PropTypes.object,
      tokensEscrowed: PropTypes.object,
      sharesEscrowed: PropTypes.object,
      cancelOrder: PropTypes.func
    }).isRequired,
    outcome: PropTypes.object,
    oddNumber: PropTypes.bool
  };

  static defaultProps = {
    outcome: null,
    oddNumber: false
  };

  constructor(props) {
    super(props);

    this.state = {
      showCancelButton: false
    };

    this.toggleCancelButton = this.toggleCancelButton.bind(this);
  }

  toggleCancelButton() {
    this.setState({ showCancelButton: !this.state.showCancelButton });
  }

  render() {
    const {
      isExtendedDisplay,
      isMobile,
      order,
      outcome,
      oddNumber
    } = this.props;

    const s = this.state;

    const orderPrice = getValue(order, "avgPrice.formatted");
    const orderShares = getValue(order, "unmatchedShares.formatted");
    const orderType = getValue(order, "type");

    return (
      <ul
        ref={order => {
          this.order = order;
        }}
        className={classNames(
          SharedStyles.Order,
          SharedStyles.Order__Extended,
          Styles.Order,
          {
            [SharedStyles["Order-not_extended"]]: isExtendedDisplay,
            [SharedStyles.Negative]: orderType === SELL,
            [SharedStyles.TableItemDark]: oddNumber
          }
        )}
      >
        <li>{order.name || orderPrice}</li>
        <li
          className={classNames(SharedStyles.Order__type, {
            [SharedStyles.Order__typeSell]: orderType === SELL
          })}
          style={{ textTransform: "capitalize" }}
        >
          {orderType}
          {order.pendingOrder && <span>Pending</span>}
        </li>
        <li>{orderShares}</li>
        <li>{orderPrice}</li>
        {outcome && <li>{getValue(outcome, "lastPrice.formatted")}</li>}
        {<li>{getValue(order, "tokensEscrowed.formatted")}</li>}
        {<li>{getValue(order, "sharesEscrowed.formatted")}</li>}
        {!isMobile &&
          order.cancelOrder && (
            <li>
              {order.pending ? (
                <button className={Styles.Order__cancel} disabled>
                  PENDING
                </button>
              ) : (
                <button
                  className={Styles.Order__cancel}
                  onClick={e => {
                    order.cancelOrder(order);
                  }}
                >
                  Cancel
                </button>
              )}
            </li>
          )}
        {isMobile && <div onClick={this.toggleCancelButton}>{threeDots}</div>}
        {s.showCancelButton && (
          <div className={Styles.Order__cancelContainer}>
            {order.pending ? (
              <button className={Styles.Order__cancel} disabled>
                PENDING
              </button>
            ) : (
              <button
                className={Styles.Order__cancel}
                onClick={e => {
                  order.cancelOrder(order);
                }}
              >
                Cancel Order
              </button>
            )}
          </div>
        )}
      </ul>
    );
  }
}
