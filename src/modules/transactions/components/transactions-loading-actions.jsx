import React, { PropTypes } from 'react';
import classNames from 'classnames';
import Spinner from 'modules/common/components/spinner';

const TransactionsLoadingActions = p => (
  <article className="transactions-loading-actions">
    {!p.transactionsLoading && !p.hasAllTransactionsLoaded &&
      <div className="transactions-load-buttons">
        <button
          className={classNames('unstyled', { disabled: p.transactionsLoading })}
          onClick={() => {
            if (!p.transactionsLoading) p.loadMoreTransactions();
          }}
        >
          <span>Load More</span>
        </button>
        <button
          className={classNames('unstyled', { disabled: p.transactionsLoading })}
          onClick={() => {
            if (!p.transactionsLoading) p.loadAllTransactions();
          }}
        >
          <span>Load All</span>
        </button>
      </div>
    }
    {p.transactionsLoading &&
      <div className="transactions-loading-spinner" >
        <span className="transactions-loading-message">Loading More History</span>
        <Spinner />
      </div>
    }
    {!p.transactionsLoading && p.hasAllTransactionsLoaded &&
      <span
        className="transactions-all-loaded-message"
      >
        All History Loaded
      </span>
    }
  </article>
);

TransactionsLoadingActions.propTypes = {
  loadMoreTransactions: PropTypes.func.isRequired,
  loadAllTransactions: PropTypes.func.isRequired,
  transactionsLoading: PropTypes.bool,
  hasAllTransactionsLoaded: PropTypes.bool
};

export default TransactionsLoadingActions;
