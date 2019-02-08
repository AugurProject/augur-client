import React from "react";
import PropTypes from "prop-types";
import determineMarketPhase from "utils/determine-market-phase";
import Styles from "modules/market/components/market-header/market-header-bar.styles";
import classNames from "classnames";
import {
  starIconOutline,
  starIconOpen,
  starIconFilled
} from "modules/common/components/icons";
import { YES_NO } from "modules/common-elements/constants";

const MarketHeaderBar = ({
  reportingState,
  addToFavorites,
  isLogged,
  isFavorite,
  isMobile,
  collapsedView,
  description,
  marketType
}) => {
  const phase = determineMarketPhase(reportingState);

  if (collapsedView) {
    return (
      <section className={Styles.MarketHeaderBar}>
        <h1 className={Styles.MarketHeaderBar__description}>{description}</h1>
      </section>
    );
  }

  return (
    <section className={Styles.MarketHeaderBar}>
      <div className={Styles.MarketHeaderBar__status}>
        <span
          className={classNames({
            [Styles.MarketHeaderBar__collapsed]: collapsedView
          })}
        >
          {phase}
        </span>
        <span
          className={classNames(
            {
              [Styles.MarketHeaderBar__underline__open]: phase === "Open"
            },
            {
              [Styles.MarketHeaderBar__underline__resolved]:
                phase === "Resolved"
            },
            {
              [Styles.MarketHeaderBar__underline__reporting]:
                phase !== "Resolved" && phase !== "Open"
            }
          )}
        />
      </div>
      <div className={Styles.MarketHeaderBar__type}>
        {marketType === YES_NO ? "Yes/No" : marketType}
      </div>
      {addToFavorites && (
        <div className={Styles.MarketHeaderBar__watchlist__container}>
          <button
            onClick={() => addToFavorites()}
            className={Styles.MarketHeaderBar__watchlist}
            disabled={!isLogged}
          >
            <span>
              {isFavorite ? (
                <span className={Styles.MarketHeaderBar__hoverContainer}>
                  <span className={Styles.MarketHeaderBar__filledIcon}>
                    {starIconFilled}
                  </span>
                </span>
              ) : (
                <span className={Styles.MarketHeaderBar__hoverContainer}>
                  <span className={Styles.MarketHeaderBar__iconDefault}>
                    {starIconOpen}
                  </span>
                  <span className={Styles.MarketHeaderBar__iconHover}>
                    {starIconOutline}
                  </span>
                </span>
              )}
              {!isMobile &&
                (isFavorite ? "Remove from watchlist" : "Add to watchlist")}
            </span>
          </button>
        </div>
      )}
    </section>
  );
};

MarketHeaderBar.propTypes = {
  reportingState: PropTypes.string,
  isLogged: PropTypes.bool,
  isFavorite: PropTypes.bool,
  addToFavorites: PropTypes.func.isRequired,
  isMobile: PropTypes.bool,
  collapsedView: PropTypes.bool,
  description: PropTypes.string.isRequired,
  marketType: PropTypes.string.isRequired
};

MarketHeaderBar.defaultProps = {
  reportingState: "",
  isLogged: false,
  isFavorite: false,
  isMobile: false,
  collapsedView: false
};

export default MarketHeaderBar;
