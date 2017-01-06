import rawSelectors from 'src/selectors-raw';

module.exports = {};

Object.keys(rawSelectors).forEach(selectorKey =>
 Object.defineProperty(module.exports,
		selectorKey,
		{ get: rawSelectors[selectorKey], enumerable: true }
));

if (module.hot) {
	module.hot.accept();

	module.hot.accept('./selectors-raw', () => {
		const hotSelectors = require('src/selectors-raw').default;

		module.exports = {};

		Object.keys(hotSelectors).forEach(selectorKey =>
			Object.defineProperty(module.exports,
				selectorKey,
				{ get: hotSelectors[selectorKey], enumerable: true }
		));
	});
}
