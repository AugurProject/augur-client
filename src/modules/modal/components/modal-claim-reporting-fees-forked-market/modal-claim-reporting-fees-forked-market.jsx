import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { augur } from 'services/augurjs'
import { formatGasCostToEther } from 'utils/format-number'

import Styles from 'modules/modal/components/modal-claim-reporting-fees-forked-market/modal-claim-reporting-fees-forked-market.styles'

export default class ModalClaimReportingFeesForkedMarket extends Component {
  static propTypes = {
    claimReportingFeesForkedMarket: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    recipient: PropTypes.string.isRequired,
    forkedMarket: PropTypes.object.isRequired,
    unclaimedEth: PropTypes.object.isRequired,
    unclaimedRep: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      ClaimReportingFeesForkedMarketGasEstimate: '0',
    }

    this.handleClaimReportingFeesForkedMarket = this.handleClaimReportingFeesForkedMarket.bind(this)
  }

  componentWillMount() {
    const options = {
      forkedMarket: this.props.forkedMarket,
      estimateGas: true,
    }
    this.props.claimReportingFeesForkedMarket(options, (err, result) => {
      if (err) {
        // Default to 0 for now if we recieve an error.
        const claimReportingFeesForkedMarketsGasEstimate = '0'
        const gasPrice = augur.rpc.getGasPrice()
        this.setState({
          ClaimReportingFeesForkedMarketGasEstimate: formatGasCostToEther(claimReportingFeesForkedMarketsGasEstimate, { decimalsRounded: 4 }, gasPrice),
        })
      } else {
        const claimReportingFeesForkedMarketsGasEstimate = result.gasEstimates.totals.all.toString()
        const gasPrice = augur.rpc.getGasPrice()
        this.setState({
          ClaimReportingFeesForkedMarketGasEstimate: formatGasCostToEther(claimReportingFeesForkedMarketsGasEstimate, { decimalsRounded: 4 }, gasPrice),
        })
      }
    })
  }

  handleClaimReportingFeesForkedMarket(e) {
    e.preventDefault()
    const options = {
      forkedMarket: this.props.forkedMarket,
      estimateGas: false,
    }
    this.props.claimReportingFeesForkedMarket(options, (err, result) => {
      this.props.closeModal()
    })
  }

  render() {
    const {
      recipient,
      unclaimedRep,
      unclaimedEth,
    } = this.props
    const s = this.state

    // In theory, this modal should never be shown if there is no unclaimed ETH/REP, but check whether button should be disabled anyway.
    let disableClaimReportingFeesForkedMarketButton = ''
    if (unclaimedRep.formatted === '-' && unclaimedEth.formatted === '-') {
      disableClaimReportingFeesForkedMarketButton = 'disabled'
    }

    return (
      <form
        className={Styles.ModalClaimReportingFeesForkedMarket__form}
        onSubmit={this.handleClaimReportingFeesForkedMarket}
      >
        <div className={Styles.ModalClaimReportingFeesForkedMarket__heading}>
          <h1>Review Withdrawl</h1>
        </div>
        <div className={Styles.ModalClaimReportingFeesForkedMarket__details}>
          <ul className={Styles.ModalClaimReportingFeesForkedMarket__info}>
            <li><span>Recipient</span><span>{recipient}</span></li>
            <li><span>Rep</span><span>{unclaimedRep.formatted}</span></li>
            <li><span>Eth</span><span>{unclaimedEth.formatted}</span></li>
            <li><span>Gas</span><span>{s.ClaimReportingFeesForkedMarketGasEstimate}</span></li>
          </ul>
        </div>
        <div className={Styles.ModalClaimReportingFeesForkedMarket__message}>
          Transferring all funds may require multiple signed transactions.
        </div>
        <div className={Styles.ModalClaimReportingFeesForkedMarket__actions}>
          <button
            className={Styles.ModalClaimReportingFeesForkedMarket__button}
            disabled={disableClaimReportingFeesForkedMarketButton}
            type="submit"
          >
            Submit
          </button>
        </div>
      </form>
    )
  }
}
