import React, { PropTypes } from 'react';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import Transaction from 'modules/transactions/components/transaction';
import TransactionGroup from 'modules/transactions/components/transaction-group';
import NullStateMessage from 'modules/common/components/null-state-message';

const Transactions = (p) => {
  const animationSpeed = parseInt(window.getComputedStyle(document.body).getPropertyValue('--animation-speed-very-slow'), 10);

  return (
    <article className="transactions">
      {p.transactions.length ?
        <CSSTransitionGroup
          transitionName="transaction"
          transitionEnter={!p.pageChanged}
          transitionEnterTimeout={animationSpeed}
          transitionLeave={false}
        >
          {p.transactions.map((transaction, i) => (
            transaction.transactions && transaction.transactions.length > 1 ?
              <TransactionGroup
                key={transaction.transactions[0].hash}
                currentBlockNumber={p.currentBlockNumber}
                {...transaction}
              /> :
              <Transaction
                key={transaction.hash}
                currentBlockNumber={p.currentBlockNumber}
                {...transaction}
              />
          ))}
        </CSSTransitionGroup> :
        <NullStateMessage
          message="No Transaction Data"
        />
      }
    </article>
  );
};

Transactions.propTypes = {
  pageChanged: PropTypes.bool.isRequired,
  className: PropTypes.string,
  transactions: PropTypes.array,
  currentBlockNumber: PropTypes.number
};

export default Transactions;
