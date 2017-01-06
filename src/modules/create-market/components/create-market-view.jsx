import React, { PropTypes } from 'react';
import CreateMarketForm from 'modules/create-market/components/create-market-form';

const CreateMarketPage = p => (
	<section id="create_market_view">
		<header className="page-header">
			<span className="big-line">Be the market maker</span>.
			Earn fees by making markets for people to trade.
			The more people <b><i>trade</i></b> your markets, the more fees you will <b><i>make</i></b>.
		</header>

		<div className="page-content">
			<CreateMarketForm
				className="create-market-content"
				{...p.createMarketForm}
				scalarShareDenomination={p.scalarShareDenomination}
			/>
		</div>
	</section>
);

CreateMarketPage.propTypes = {
	className: PropTypes.string,
	createMarketForm: PropTypes.object
};

export default CreateMarketPage;
