import React, { PropTypes } from 'react';
import classNames from 'classnames';
import Link from 'modules/link/components/link';
import ValueDenomination from 'modules/common/components/value-denomination';
import ValueTimestamp from 'modules/common/components/value-timestamp';
import ReportEthics from 'modules/my-reports/components/report-ethics';

import { CREATE_MARKET, BUY, SELL, BID, ASK, SHORT_SELL, SHORT_ASK, MATCH_BID, MATCH_ASK, COMMIT_REPORT, REVEAL_REPORT, GENERATE_ORDER_BOOK, CANCEL_ORDER, SELL_COMPLETE_SETS } from 'modules/transactions/constants/types';
import { FUND_ACCOUNT } from 'modules/auth/constants/auth-types';
import { SCALAR, CATEGORICAL } from 'modules/markets/constants/market-types';

import getValue from 'utils/get-value';

const TransactionSummary = p => (
  <article className={classNames('transaction-summary', p.isGroupedTransaction && 'transaction-grouped')}>
    {p.data.marketLink ?
      <Link {...p.data.marketLink}>
        <TransactionSummaryContent {...p} />
      </Link> :
      <TransactionSummaryContent {...p} />
    }
  </article>
);

const TransactionSummaryContent = p => (
  <div className="transaction-summary-content">
    <div className="transaction-action">
      {transactionAction(p)}
      {transactionActionDetails(p)}
    </div>
    <div className="transaction-description">
      <span>{transactionDescription(p)}</span>
    </div>
    <ValueTimestamp
      className="transaction-timestamp"
      {...p.timestamp}
    />
  </div>
);

function transactionAction(transaction) {
  const action = () => {
    switch (transaction.type) {
      case FUND_ACCOUNT:
        return 'Fund Account ';
      case BUY:
        return 'Buy ';
      case BID:
        return 'Bid ';
      case SELL:
        return 'Sell ';
      case ASK:
        return 'Ask ';
      case SHORT_SELL:
        return 'Short Sell ';
      case SHORT_ASK:
        return 'Short Ask ';
      case MATCH_BID:
        return 'Bid Filled ';
      case MATCH_ASK:
        return 'Ask Filled ';
      case CANCEL_ORDER:
        return 'Cancel Order ';
      case SELL_COMPLETE_SETS:
        return `Redeem ${transaction.numShares.formatted} Complete Sets `;
      case CREATE_MARKET:
        return 'Create Market ';
      case GENERATE_ORDER_BOOK:
        return 'Generate Order Book ';
      case COMMIT_REPORT:
      case REVEAL_REPORT:
        return transaction.type === COMMIT_REPORT ? 'Commit Report ' : 'Reveal Report ';
      default:
        return transaction.type;
    }
  };

  return <span className="transaction-action-type">{action()}</span>;
}

function transactionActionDetails(transaction) {
  switch (transaction.type) {
    case BUY:
    case BID:
    case SELL:
    case ASK:
    case SHORT_SELL:
    case SHORT_ASK:
    case MATCH_BID:
    case MATCH_ASK: {
      return (
        <div className="transaction-trade-action-details">
          <ValueDenomination
            className="transaction-shares"
            {...transaction.numShares}
          />
          {transaction.data.marketType === CATEGORICAL &&
            <span>
              <span className="short-word"> of </span><span className="outcome-name">{transaction.data.outcomeName && transaction.data.outcomeName.toString().substring(0, 35) + ((transaction.data.outcomeName.toString().length > 35 && '...') || '')}</span>
            </span>
          }
          <span className="at"> @ </span>
          <ValueDenomination className="noFeePrice" {...transaction.noFeePrice} />
        </div>
      );
    }
    case CANCEL_ORDER: {
      return (
        <div className="transaction-trade-action-details">
          <span className="short-word">to</span>
          <span> {transaction.data.order.type} </span>
          <ValueDenomination {...transaction.data.order.shares} />
          <span className="short-word"> of </span>
          <span className="outcome-name">{transaction.data.outcome.name && transaction.data.outcome.name.substring(0, 35) + ((transaction.data.outcome.name.length > 35 && '...') || '')}</span>
        </div>
      );
    }
    case COMMIT_REPORT:
    case REVEAL_REPORT: {
      const type = getValue(transaction, 'data.market.type');
      const outcomeName = getValue(transaction, 'data.outcome.name');
      const reportedOutcome = (transaction.data.isScalar || type === SCALAR) ?
        transaction.data.reportedOutcomeID :
        outcomeName && `${outcomeName.substring(0, 35)}${outcomeName.length > 35 && '...'}`;

      return (
        <div className="transaction-trade-action-report-details">
          {!!reportedOutcome &&
            <span className="transaction-reported-outcome">{reportedOutcome}</span>
          }
          {!!transaction.data.isUnethical &&
            <ReportEthics isUnethical={transaction.data.isUnethical} />
          }
        </div>
      );
    }
    default:
      break;
  }
}

function transactionDescription(transaction) {
  switch (transaction.type) {
    case FUND_ACCOUNT:
      return 'Request testnet Ether and Reputation';
    default:
      return transaction.description;
  }
}

TransactionSummary.propTypes = {
  type: PropTypes.string.isRequired
};

export default TransactionSummary;
