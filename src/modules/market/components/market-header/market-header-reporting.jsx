/* eslint react/no-array-index-key: 0 */

import React, { Component } from "react";
import classNames from "classnames";

import PropTypes from "prop-types";
import Styles from "modules/market/components/market-header/market-header-reporting.styles";
import { constants } from "services/constants";
import MarketLink from "modules/market/components/market-link/market-link";
import MarketHeaderStyles from "modules/market/components/market-header/market-header.styles";
import { CATEGORICAL } from "modules/markets/constants/market-types";
import { createBigNumber } from "utils/create-big-number";
import {
  TYPE_REPORT,
  TYPE_DISPUTE
} from "modules/markets/constants/link-types";

export default class MarketHeaderReporting extends Component {
  static propTypes = {
    currentTimestamp: PropTypes.number.isRequired,
    market: PropTypes.object.isRequired,
    isDesignatedReporter: PropTypes.bool,
    finalizeMarket: PropTypes.func.isRequired,
    claimTradingProceeds: PropTypes.func.isRequired,
    getWinningBalances: PropTypes.func.isRequired,
    tentativeWinner: PropTypes.object,
    isLogged: PropTypes.bool
  };

  static defaultProps = {
    isDesignatedReporter: false,
    tentativeWinner: {},
    isLogged: false
  };

  constructor(props) {
    super(props);
    this.state = {
      disableFinalize: false
    };
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.props.isLogged && this.props.market.id !== nextProps.market.id) {
      this.checkWinnings(nextProps.market, nextProps.isLogged);
    }
  }

  checkWinnings(market, isLogged) {
    const { getWinningBalances } = this.props;
    if (
      isLogged &&
      market.reportingState === constants.REPORTING_STATE.FINALIZED
    ) {
      getWinningBalances(market.id);
    }
  }

  render() {
    const {
      market,
      isDesignatedReporter,
      finalizeMarket,
      claimTradingProceeds,
      tentativeWinner,
      isLogged,
      currentTimestamp
    } = this.props;
    const {
      reportingState,
      id,
      consensus,
      outstandingReturns,
      finalizationTime
    } = market;

    let CatWinnerColorIndex = null;
    let canClaim = false;
    if (finalizationTime && outstandingReturns) {
      const endTimestamp = createBigNumber(finalizationTime).plus(
        createBigNumber(constants.CONTRACT_INTERVAL.CLAIM_PROCEEDS_WAIT_TIME)
      );
      const timeHasPassed = createBigNumber(currentTimestamp).minus(
        endTimestamp
      );
      canClaim = timeHasPassed.toNumber() > 0;
    }
    if (market.marketType === CATEGORICAL) {
      if (tentativeWinner && tentativeWinner.id) {
        CatWinnerColorIndex = (parseInt(tentativeWinner.id, 10) + 1).toString();
      }
      if (consensus && consensus.winningOutcome) {
        CatWinnerColorIndex = parseInt(consensus.winningOutcome, 10).toString();
      }
    }
    let content = null;
    if (consensus && (consensus.winningOutcome || consensus.isInvalid)) {
      content = [
        <div
          key="consensus"
          className={classNames(
            Styles.MarketHeaderReporting__winner__container,
            Styles.MarketHeaderReporting__winner__container__set,
            Styles[
              `MarketHeaderReporting__winner__container__color__${CatWinnerColorIndex}`
            ]
          )}
        >
          <div className={Styles.MarketHeaderReporting__outcomeContainer}>
            <span
              className={MarketHeaderStyles.MarketHeader__property__header}
              style={{ marginRight: "0px" }}
            >
              Winning Outcome
            </span>
            <span className={Styles.MarketHeaderReporting__winner__row}>
              <div className={Styles.MarketHeaderReporting__winner}>
                {consensus.isInvalid
                  ? "Invalid"
                  : consensus.outcomeName || consensus.winningOutcome}
              </div>
            </span>
          </div>
          {reportingState ===
            constants.REPORTING_STATE.AWAITING_FINALIZATION && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <button
                className={Styles.MarketHeaderReporting__button}
                onClick={() => {
                  this.setState({ disableFinalize: true });
                  finalizeMarket(id, err => {
                    if (err) {
                      this.setState({ disableFinalize: false });
                    }
                  });
                }}
                disabled={this.state.disableFinalize || !isLogged}
              >
                Finalize
              </button>
            </div>
          )}
          {canClaim &&
            reportingState === constants.REPORTING_STATE.FINALIZED && (
              <div style={{ display: "flex", alignItems: "center" }}>
                <button
                  className={Styles.MarketHeaderReporting__button}
                  onClick={() => {
                    claimTradingProceeds(id);
                  }}
                  disabled={!isLogged}
                >
                  Claim Proceeds
                </button>
              </div>
            )}
        </div>
      ];
    } else if (
      reportingState === constants.REPORTING_STATE.CROWDSOURCING_DISPUTE ||
      reportingState === constants.REPORTING_STATE.AWAITING_NEXT_WINDOW
    ) {
      content = [
        <div
          key="dispute"
          className={Styles.MarketHeaderReporting__winner__container}
        >
          <div>
            <span className={MarketHeaderStyles.MarketHeader__property__header}>
              Tentative Winning Outcome
            </span>
            <span className={Styles.MarketHeaderReporting__winner__row}>
              {CatWinnerColorIndex && (
                <div
                  className={
                    Styles[
                      `MarketHeaderReporting__winner__color__${CatWinnerColorIndex}`
                    ]
                  }
                />
              )}
              {tentativeWinner &&
              (tentativeWinner.name || tentativeWinner.isInvalid) ? (
                <div className={Styles.MarketHeaderReporting__winner}>
                  {tentativeWinner &&
                    (tentativeWinner.isInvalid
                      ? "Invalid"
                      : tentativeWinner.name)}
                </div>
              ) : (
                <div style={{ minHeight: "20px" }} />
              )}
            </span>
          </div>
          {reportingState === constants.REPORTING_STATE.CROWDSOURCING_DISPUTE &&
            isLogged && (
              <div
                className={Styles.MarketHeaderReporting__winner}
                style={{ marginTop: "0.5rem" }}
              >
                <MarketLink
                  className={Styles.MarketHeaderReporting__button}
                  id={id}
                  linkType={TYPE_DISPUTE}
                  location={location}
                >
                  Dispute
                </MarketLink>
              </div>
            )}
          {reportingState === constants.REPORTING_STATE.CROWDSOURCING_DISPUTE &&
            !isLogged && (
              <div>
                <button
                  className={Styles.MarketHeaderReporting__button}
                  disabled={!isLogged}
                >
                  Dispute
                </button>
              </div>
            )}
        </div>
      ];
    } else if (
      (reportingState === constants.REPORTING_STATE.DESIGNATED_REPORTING &&
        isDesignatedReporter) ||
      reportingState === constants.REPORTING_STATE.OPEN_REPORTING
    ) {
      if (isLogged) {
        content = [
          <div
            key="report"
            className={Styles.MarketHeaderReporting__single__container}
          >
            <MarketLink
              className={Styles.MarketHeaderReporting__buttonNoMargin}
              id={id}
              linkType={TYPE_REPORT}
              location={location}
            >
              Submit a Report
            </MarketLink>
          </div>
        ];
      } else {
        content = [
          <div
            key="disabledReport"
            className={
              Styles.MarketHeaderReporting__single__container__disabled
            }
          >
            <button
              className={Styles.MarketHeaderReporting__buttonNoMargin}
              disabled={!isLogged}
            >
              Submit a Report
            </button>
          </div>
        ];
      }
    }

    if (!content) {
      return null;
    }

    return (
      <div className={Styles.MarketHeaderReporting__container}>{content}</div>
    );
  }
}
