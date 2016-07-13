import React from 'react';
import TradePanelRow from '../../../modules/trade/components/trade-panel-row';
import { ORDER } from '../../../modules/trade/constants/row-types';

const TradePanelBody = (p) => {
	let orderBookRows = [];
	const orderBookLength =	Math.max(p.outcome.orderBook.bids.length, p.outcome.orderBook.asks.length);
	const secondItemIndex = 1; // first item is displayed in different row

	for (let i = secondItemIndex; i < orderBookLength; i++) {
		orderBookRows.push(
			<TradePanelRow
				key={`outcome-${i}`}
				outcome={p.outcome}
				selectedOutcomeID={p.selectedOutcomeID}
				orderSides={p.orderSides}
				itemIndex={i}
				type={ORDER}
			/>
		);
	}

	return (
		<tbody
			id={`${p.outcome.name}-${p.outcome.id}`}
			className="trade-panel-body"
		>
			<TradePanelRow
				outcome={p.outcome}
				sideOptions={p.sideOptions}
				updateSelectedOutcome={p.updateSelectedOutcome}
				orderSides={p.orderSides}
			/>
			{orderBookRows}
		</tbody>
	);
};

TradePanelBody.propTypes = {
	outcome: React.PropTypes.object,
	sideOptions: React.PropTypes.array,
	selectedOutcomeID: React.PropTypes.string,
	updateSelectedOutcome: React.PropTypes.func,
	orderSides: React.PropTypes.object
};

export default TradePanelBody;
