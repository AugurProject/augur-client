import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Helmet } from 'react-helmet'
import { augur } from 'services/augurjs'

import speedomatic from 'speedomatic'
import { formatGasCostToEther } from 'utils/format-number'
import MarketPreview from 'modules/market/components/market-preview/market-preview'
import NullStateMessage from 'modules/common/components/null-state-message/null-state-message'
import ReportingDisputeForm from 'modules/reporting/containers/reporting-dispute-form'
import ReportingDisputeConfirm from 'modules/reporting/components/reporting-dispute-confirm/reporting-dispute-confirm'
import { TYPE_VIEW } from 'modules/market/constants/link-types'

import { isEmpty } from 'lodash'
import FormStyles from 'modules/common/less/form'
import Styles from 'modules/reporting/components/reporting-report/reporting-report.styles'


export default class ReportingDispute extends Component {

  static propTypes = {
    history: PropTypes.object.isRequired,
    market: PropTypes.object.isRequired,
    universe: PropTypes.string.isRequired,
    marketId: PropTypes.string.isRequired,
    isConnected: PropTypes.bool.isRequired,
    isMarketLoaded: PropTypes.bool.isRequired,
    loadFullMarket: PropTypes.func.isRequired,
    submitMarketContribute: PropTypes.func.isRequired,
    estimateSubmitMarketContribute: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      currentStep: 0,
      showingDetails: true,
      gasEstimate: '0',
      disputeBondFormatted: '0',
      isMarketInValid: null,
      currentOutcome: {},
      selectedOutcome: '',
      selectedOutcomeName: '',
      stake: 0,
      validations: {
        stake: false,
        selectedOutcome: null,
      },
    }

    this.prevPage = this.prevPage.bind(this)
    this.nextPage = this.nextPage.bind(this)
    this.updateState = this.updateState.bind(this)
    this.toggleDetails = this.toggleDetails.bind(this)
  }

  componentWillMount() {
    if (this.props.isConnected && !this.props.isMarketLoaded) {
      this.props.loadFullMarket()
    }
  }

  prevPage() {
    this.setState({ currentStep: this.state.currentStep <= 0 ? 0 : this.state.currentStep - 1 })
  }

  nextPage() {
    this.setState({ currentStep: this.state.currentStep >= 1 ? 1 : this.state.currentStep + 1 })
    // estimate gas, user is moving to confirm
    this.calculateGasEstimates()
  }

  updateState(newState) {
    this.setState(newState)
  }

  toggleDetails() {
    this.setState({ showingDetails: !this.state.showingDetails })
  }

  calculateGasEstimates() {
    if (this.state.stake > 0) {
      const amount = speedomatic.fix(this.state.stake, 'hex')
      this.props.estimateSubmitMarketContribute(this.props.market.id, amount, (err, gasEstimateValue) => {
        if (err) return console.error(err)

        const gasPrice = augur.rpc.getGasPrice()
        this.setState({
          gasEstimate: formatGasCostToEther(gasEstimateValue, { decimalsRounded: 4 }, gasPrice),
        })
      })
    }
  }

  render() {
    const s = this.state
    const p = this.props

    return (
      <section>
        <Helmet>
          <title>Submit Dispute</title>
        </Helmet>
        { !isEmpty(p.market) &&
        <MarketPreview
          {...p.market}
          isLogged={p.isLogged}
          location={p.location}
          history={p.history}
          cardStyle="single-card"
          linkType={TYPE_VIEW}
          buttonText="View"
          showAdditionalDetailsToggle
          showingDetails={s.showingDetails}
          toggleDetails={this.toggleDetails}
        />
        }
        { !isEmpty(p.market) && s.showingDetails &&
          <div className={Styles[`ReportingReportMarket__details-container-wrapper`]}>
            <div className={Styles[`ReportingReportMarket__details-container`]}>
              <div className={Styles.ReportingReportMarket__details}>
                <span>
                  {p.market.extraInfo}
                </span>
              </div>
              <div className={Styles[`ReportingReportMarket__resolution-source`]}>
                <h4>Resolution Source:</h4>
                <span>{p.market.resolutionSource || 'Outcome will be determined by news media'}</span>
              </div>
            </div>
          </div>
        }
        { !isEmpty(p.market) &&
          <article className={FormStyles.Form}>
            { s.currentStep === 0 &&
              <ReportingDisputeForm
                market={p.market}
                updateState={this.updateState}
                stake={s.stake}
              />
            }
            { s.currentStep === 1 &&
              <ReportingDisputeConfirm
                market={p.market}
                isMarketInValid={s.isMarketInValid}
                selectedOutcome={s.selectedOutcomeName}
                stake={s.stake}
                currentOutcome={s.currentOutcome}
                gasEstimate={s.gasEstimate}
                disputeBondFormatted={s.disputeBondFormatted}
              />
            }
            <div className={FormStyles.Form__navigation}>
              <button
                className={classNames(FormStyles.Form__prev, { [`${FormStyles['hide-button']}`]: s.currentStep === 0 })}
                onClick={this.prevPage}
              >Previous
              </button>
              <button
                className={classNames(FormStyles.Form__next, { [`${FormStyles['hide-button']}`]: s.currentStep === 1 })}
                disabled={!Object.keys(s.validations).every(key => s.validations[key] === true)}
                onClick={Object.keys(s.validations).every(key => s.validations[key] === true) ? this.nextPage : undefined}
              >Review
              </button>
              { s.currentStep === 1 &&
              <button
                className={FormStyles.Form__submit}
                onClick={() => p.submitMarketContribute(p.market.id, s.selectedOutcome, s.isMarketInValid, speedomatic.fix(s.stake, 'hex'), p.history)}
              >Submit
              </button>
              }
            </div>
          </article>
        }
        { isEmpty(p.market) &&
          <div className={Styles.NullState}>
            <NullStateMessage
              message="Market not found"
              className={Styles.NullState}
            />
          </div>
        }
      </section>
    )
  }
}
