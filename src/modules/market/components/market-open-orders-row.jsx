import React from 'react';

import ValueDenomination from 'modules/common/components/value-denomination';

import { SCALAR } from 'modules/markets/constants/market-types';

import getValue from 'utils/get-value';
import setShareDenomination from 'utils/set-share-denomination';

const MarketOpenOrdersRow = (p) => {
	const unmatchedShares = setShareDenomination(getValue(p, 'unmatchedShares.formatted'), p.selectedShareDenomination);

	return (
		<article className={`market-open-orders-row not-selectable ${p.isFirst ? 'isFirst' : ''}`} >
			{p.isFirst ?
				<span>
					{p.marketType === SCALAR ?
						<ValueDenomination formatted={p.lastPricePercent} /> :
						<span>{p.name}</span>
					}
				</span> :
				<span />
			}
			<span>{p.type}</span>
			<ValueDenomination formatted={unmatchedShares} />
			<ValueDenomination {...p.avgPrice} />
			<span>{renderCancelNode(p.id, p.marketID, p.type, p.status, p.cancellationStatuses, p.cancelOrder, p.abortCancelOrderConfirmation, p.showCancelOrderConfirmation)}</span>
		</article>
	);
};

function renderCancelNode(orderID, marketID, type, status, cancellationStatuses, cancelOrder, abortCancelOrderConfirmation, showCancelOrderConfirmation) {
	switch (status) {
		case cancellationStatuses.CANCELLATION_CONFIRMATION:
			return (
				<span>
					<button
						className="unstyled no confirm"
						onClick={(event) => { abortCancelOrderConfirmation(orderID, marketID, type); }}
					>
						No
					</button>
					<button
						className="unstyled yes confirm"
						onClick={(event) => {
							cancelOrder(orderID, marketID, type);
						}}
					>
						Yes
					</button>
				</span>
			);
		case cancellationStatuses.CANCELLING:
			return 'Cancelling';
		case cancellationStatuses.CANCELLATION_FAILED:
			return 'Failure';
		case cancellationStatuses.CANCELLED:
			return null;
		default:
			return (
				<button
					className="unstyled cancel"
					onClick={(event) => {
						showCancelOrderConfirmation(orderID, marketID, type);
					}}
				>
					<i></i> cancel
				</button>
			);
	}
}

export default MarketOpenOrdersRow;
