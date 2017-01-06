import memoizerific from 'memoizerific';
import store from '../../../store';
import updateSelectedOutcome from '../../outcomes/actions/update-selected-outcome';

export default () =>
	({
		selectedOutcomeID: store.getState().selectedOutcomeID,
		updateSelectedOutcome: selectUpdateSelectedOutcome(store.dispatch)
	});

const selectUpdateSelectedOutcome = memoizerific(1)(dispatch =>
	selectedOutcomeID => dispatch(updateSelectedOutcome(selectedOutcomeID))
);
