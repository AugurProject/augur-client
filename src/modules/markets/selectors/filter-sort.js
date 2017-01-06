import { updateSelectedFilterSort } from '../../markets/actions/update-selected-filter-sort';
import { FILTER_TYPE_OPEN, FILTER_TYPE_CLOSED, FILTER_TYPE_REPORTING } from '../../markets/constants/filter-sort';
import store from '../../../store';

export default function () {
	// NOTE -- the filtering + sorting of the markets are separated respectively
	// 	filtering: `markets/selectores/markets-filtered.js`
	//	sorting: `markets/selectors/markets-all.js`

	const { selectedFilterSort } = store.getState();

	return {
		types: selectTypeOptions,
		sorts: selectSortOptions,
		order: selectOrderOptions,
		onChange: selectOnChange,
		selectedFilterSort
	};
}

const selectTypeOptions = [
	{
		label: 'Open',
		value: FILTER_TYPE_OPEN
	},
	{
		label: 'Reporting',
		value: FILTER_TYPE_REPORTING
	},
	{
		label: 'Closed',
		value: FILTER_TYPE_CLOSED
	}
];

const selectSortOptions = [
	{
		label: 'Volume',
		value: 'volume'
	},
	{
		label: 'Newest',
		value: 'creationTime'
	},
	{
		label: 'Expiration',
		value: 'endDate'
	},
	{
		label: 'Taker Fee',
		value: 'takerFeePercent'
	},
	{
		label: 'Maker Fee',
		value: 'makerFeePercent'
	}
];

const selectOrderOptions = {
	isDesc: true
};

const selectOnChange = (type, sort, order) => {
	const { selectedFilterSort } = store.getState();

	const isDesc = order !== null && order !== selectedFilterSort.isDesc ? order : null;

	const selections = { type, sort, isDesc };
	const changes = Object.keys(selections).reduce((prev, item) => {
		if (selections[item] !== null) {
			return { ...prev, [item]: selections[item] };
		}
		return { ...prev };
	}, {});

	store.dispatch(updateSelectedFilterSort(changes));
};
