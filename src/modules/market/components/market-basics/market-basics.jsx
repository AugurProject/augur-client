/* eslint react/no-array-index-key: 0 */  // It's OK in this specific instance as order remains the same

import React from 'react'
import PropTypes from 'prop-types'
// import { Link } from 'react-router-dom';
// import classNames from 'classnames';

import SVG from 'modules/common/components/svg/svg';

// import makePath from 'modules/app/helpers/make-path';
// import makeQuery from 'modules/app/helpers/make-query';

// import { MARKET } from 'modules/app/constants/views';
// import { MARKET_ID_PARAM_NAME, MARKET_DESCRIPTION_PARAM_NAME } from 'modules/app/constants/param-names';

import Styles from 'modules/market/components/market-basics/market-basics.styles'

const MarketBasics = (p) => {

  // set market status
  let marketStatus = p.isOpen ? 'open' : 'closed';
  if (marketStatus === 'open' && p.isResported) {
    marketStatus = 'reported';
  }

  return (
    <article className={Styles.MarketBasics}>
      <div className={Styles.MarketBasics__content}>
        <div className={Styles.MarketBasics__header}>
          <ul className={Styles.MarketBasics__tags}>
            <li>Tags</li>
            {(p.tags || []).map((tag, i) => (
              <li key={i}>
                <button onClick={() => p.toggleTag(tag.name ? tag.name : tag)}>
                  {tag.name ? tag.name : tag}
                </button>
              </li>
            ))}
          </ul>

          <span className={Styles.MarketBasics__status}>
            <SVG id={`market-status--${marketStatus}`} />
          </span>
        </div>

        <h1>{ p.description }</h1>
      </div>

      {/*
      {p.id && p.formattedDescription ?
        <Link
          to={{
            pathname: makePath(MARKET),
            search: makeQuery({
              [MARKET_DESCRIPTION_PARAM_NAME]: p.formattedDescription,
              [MARKET_ID_PARAM_NAME]: p.id
            })
          }}
          className="market-description"
        >
          {p.description}
        </Link> :
        <span className="market-description">{p.description}</span>
      }
      */}
    </article>
  );
};

MarketBasics.propTypes = {
  isLogged: PropTypes.bool.isRequired,
  toggleFavorite: PropTypes.func
}

export default MarketBasics
