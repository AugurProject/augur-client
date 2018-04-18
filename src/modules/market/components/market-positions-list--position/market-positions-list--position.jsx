/* eslint-disable jsx-a11y/no-static-element-interactions */ // needed because <button> cannot take the place <ul> in the table structure
/* eslint-disable react/no-array-index-key */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { createBigNumber } from 'utils/create-big-number'
import getValue from 'utils/get-value'

import { SELL } from 'modules/trade/constants/types'

import Styles from 'modules/market/components/market-positions-list--position/market-positions-list--position.styles'

export default class Position extends Component {
  static propTypes = {
    outcomeName: PropTypes.string.isRequired,
    position: PropTypes.object.isRequired,
    openOrders: PropTypes.array.isRequired,
    isExtendedDisplay: PropTypes.bool.isRequired,
    isMobile: PropTypes.bool.isRequired,
  }

  static calcAvgDiff(position, order) {
    const positionAvg = createBigNumber(getValue(position, 'avgPrice.formattedValue') || 0)
    const positionShares = createBigNumber(getValue(position, 'qtyShares.formattedValue') || 0)

    const orderPrice = createBigNumber(getValue(order, 'avgPrice.formattedValue') || 0)
    const orderShares = createBigNumber(getValue(order, 'unmatchedShares.formattedValue') || 0)

    const newAvg = ((positionAvg.times(positionShares)).plus((orderPrice.times(orderShares)))).dividedBy((positionShares.plus(orderShares)))
    const avgDiff = newAvg.minus(positionAvg).toFixed(4)

    return avgDiff < 0 ? avgDiff : `+${avgDiff}`
  }

  constructor(props) {
    super(props)

    this.state = {
      showConfirm: false,
      confirmHeight: 'auto',
      confirmMargin: '0px',
    }

    this.toggleConfirm = this.toggleConfirm.bind(this)
  }

  toggleConfirm() {
    let {
      confirmHeight,
      confirmMargin,
    } = this.state

    if (!this.state.showConfirm) {
      confirmHeight = `${this.position.clientHeight}px`
    }

    if (this.position.offsetTop !== this.confirmMessage.offsetTop) {
      confirmMargin = `${this.position.offsetTop - this.confirmMessage.offsetTop}px`
    }

    this.setState({
      confirmHeight,
      confirmMargin,
      showConfirm: !this.state.showConfirm,
    })
  }

  render() {
    const {
      isExtendedDisplay,
      isMobile,
      outcomeName,
      openOrders,
      position,
    } = this.props
    const s = this.state

    const confirmStyle = {
      height: s.confirmHeight,
      marginTop: s.confirmMargin,
    }

    return (
      <ul
        ref={(position) => { this.position = position }}
        className={!isMobile ? Styles.Position : Styles.PortMobile}
      >
        <li>
          { outcomeName }
          { openOrders && openOrders.length > 0 && openOrders.map((order, i) => (
            <div key={i} className={Styles.Position__pending}>
              <span className={Styles['Position__pending-title']}>{order.pending ? `Pending` : `Open`}</span>
              <span className={Styles['Position__pending-message']}>{ getValue(order, 'type') === SELL ? 'Selling' : 'Buying'} { getValue(order, 'unmatchedShares.formatted') } Shares of { getValue(order, 'name') } at { getValue(order, 'avgPrice.formatted') } ETH</span>
            </div>
          ))}
        </li>
        <li>
          { getValue(position, 'qtyShares.formatted') }
          { openOrders && openOrders.length > 0 && openOrders.map((order, i) => (
            <div key={i} className={Styles.Position__pending}>
              <span>{ getValue(order, 'type') === SELL ? '-' : '+'}{ getValue(order, 'unmatchedShares.formatted') }</span>
            </div>
          ))}
        </li>
        <li>
          { getValue(position, 'purchasePrice.formatted') }
          { openOrders && openOrders.length > 0 && openOrders.map((order, i) => (
            <div key={i} className={Styles.Position__pending}>
              <span>{ Position.calcAvgDiff(position, order) }</span>
            </div>
          ))}
        </li>
        { isExtendedDisplay && !isMobile &&
          <li>
            {getValue(position, 'lastPrice.formatted') }
          </li>
        }
        { !isMobile && <li>{ getValue(position, 'unrealizedNet.formatted') }</li>}
        { !isMobile && <li>{ getValue(position, 'realizedNet.formatted')} </li> }
        { isExtendedDisplay &&
          <li>
            {getValue(position, 'totalNet.formatted') }
          </li>
        }
        <li>
          <button onClick={this.toggleConfirm}>Close</button>
        </li>
        <div
          ref={(confirmMessage) => { this.confirmMessage = confirmMessage }}
          className={classNames(Styles.Position__confirm, { [`${Styles['is-open']}`]: s.showConfirm })}
          style={confirmStyle}
        >
          { openOrders.length > 0 ?
            <div className={Styles['Position__confirm-details']}>
              <p>Positions cannot be closed while orders are pending for this Outcome.</p>
              <div className={Styles['Position__confirm-options']}>
                <button onClick={this.toggleConfirm}>Ok</button>
              </div>
            </div>
            :
            <div className={Styles['Position__confirm-details']}>
              <p>Close position by selling { getValue(position, 'qtyShares.formatted') } shares of “{ outcomeName }” at market price?</p>
              <div className={Styles['Position__confirm-options']}>
                <button onClick={(e) => { position.closePosition(position.marketId, position.outcomeId); this.toggleConfirm() }}>Yes</button>
                <button onClick={this.toggleConfirm}>No</button>
              </div>
            </div>
          }
        </div>
      </ul>
    )
  }
}
