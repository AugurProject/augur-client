import React from 'react';
import classnames from 'classnames';

import MarketProperties from 'modules/market/components/market-properties';
import Link from 'modules/link/components/link';

const MarketBasics = p => (
	<article className="market-basics">
		<div className="market-basics-header">
			<div className="market-basics-header-group-1">
				{!!p.tags && !!p.tags.length &&
					<ul className="tags">
						{p.tags.map((tag, i) => (
							<li key={i} className={classnames('tag', 'pointer', { link: !!tag.name })} >
								<button
									className="unstyled"
									onClick={tag.onClick && tag.onClick}
								>
									{tag.name ? tag.name : tag}
								</button>
							</li>
						))}
					</ul>
				}
			</div>
			<div className="market-basics-header-group-2">
				{p.loginAccount && p.loginAccount.address && p.onClickToggleFavorite &&
					<button
						className={classnames('button unstyled favorite-button', { on: p.isFavorite })}
						onClick={p.onClickToggleFavorite}
					>
						{p.isFavorite ? <i></i> : <i></i>}
					</button>
				}
			</div>
		</div>

		{p.marketLink ?
			<Link
				{...p.marketLink}
				onClick={p.marketLink.onClick}
				className="market-description"
			>
				{p.description}
			</Link> :
			<span className="market-description">{p.description}</span>
		}

		<MarketProperties {...p} />
	</article>
);

// TODO -- Prop Validations
// MarketBasics.propTypes = {
// 	description: PropTypes.string,
// 	endDate: PropTypes.object,
// 	makerFeePercent: PropTypes.object,
// 	takerFeePercent: PropTypes.object,
// 	volume: PropTypes.object,
// 	tags: PropTypes.array,
// 	updateData: PropTypes.func,
// 	isMarketDataLoading: PropTypes.bool
// };

export default MarketBasics;
