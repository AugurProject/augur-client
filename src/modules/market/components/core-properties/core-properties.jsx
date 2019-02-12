/* eslint react/no-array-index-key: 0 */

import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { SCALAR } from "modules/common-elements/constants";
import Styles from "modules/market/components/core-properties/core-properties.styles";
import getValue from "utils/get-value";
import { infoIcon } from "modules/common/components/icons";
import ReactTooltip from "react-tooltip";
import TooltipStyles from "modules/common/less/tooltip.styles";

const CoreProperties = ({ market, isMobileSmall, isMobile }) => (
  <div className={Styles.CoreProperties__coreContainer}>
    <div className={Styles.CoreProperties__property__container}>
      <div
        className={Styles.CoreProperties__column}
        style={{ flexGrow: "1", maxWidth: "180px" }}
      >
        <div className={Styles.CoreProperties__property}>
          <span>
            <div>Total Volume</div>
          </span>
          <span>{getValue(market, "volume.formatted")} ETH</span>
        </div>
        <div className={Styles.CoreProperties__property}>
          <span>
            <div>24hr Volume</div>
          </span>
          <span>{getValue(market, "volume.formatted")} ETH</span>
        </div>
        {getValue(market, "marketType") === SCALAR && (
          <div className={Styles.CoreProperties__property}>
            <span>
              <div>Denominated In</div>
            </span>
            <span>{getValue(market, "scalarDenomination")}</span>
          </div>
        )}
      </div>
      <div className={Styles.CoreProperties__column}>
        <div className={Styles.CoreProperties__property}>
          <span>
            <div>Open Interest</div>
          </span>
          <span>{getValue(market, "openInterest.formatted")} ETH</span>
        </div>
        <div className={Styles.CoreProperties__property}>
          <span>
            <div>Estimated Fee</div>
          </span>
          <span>{getValue(market, "settlementFeePercent.full")}</span>
        </div>
        <div>
          <label
            className={classNames(
              TooltipStyles.TooltipHint,
              Styles["CoreProperties__property-tooltip"]
            )}
            data-tip
            data-for="tooltip--market-fees"
          >
            {infoIcon}
          </label>
          <ReactTooltip
            id="tooltip--market-fees"
            className={TooltipStyles.Tooltip}
            effect="solid"
            place="right"
            type="light"
          >
            <h4>Trading Settlement Fee</h4>
            <p>
              The trading settlement fee is a combination of the Market Creator
              Fee (<b>{getValue(market, "marketCreatorFeeRatePercent.full")}</b>
              ) and the Reporting Fee (
              <b>{getValue(market, "reportingFeeRatePercent.full")}</b>)
            </p>
          </ReactTooltip>
        </div>
        {getValue(market, "marketType") === SCALAR && (
          <div className={Styles.CoreProperties__min__max__dots}>
            <div>
              <span className={Styles.CoreProperties__property__min__max}>
                <div>Min</div>
              </span>
              <span>{getValue(market, "minPrice").toString()}</span>
            </div>
            <span className={Styles.CoreProperties__dotted__line} />
            <div>
              <span className={Styles.CoreProperties__property__min__max}>
                <div>Max</div>
              </span>
              <span>{getValue(market, "maxPrice").toString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

CoreProperties.propTypes = {
  market: PropTypes.object.isRequired,
  isMobileSmall: PropTypes.bool,
  isMobile: PropTypes.bool
};

CoreProperties.defaultProps = {
  isMobileSmall: false,
  isMobile: false
};

export default CoreProperties;
