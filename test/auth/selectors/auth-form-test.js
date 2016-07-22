import proxyquire from 'proxyquire';
import * as mockStore from '../../mockStore';
import { INVALID_USERNAME_OR_PASSWORD, USERNAME_REQUIRED, PASSWORDS_DO_NOT_MATCH, PASSWORD_TOO_SHORT, USERNAME_TAKEN } from '../../../src/modules/auth/constants/form-errors';
import assertions from 'augur-ui-react-components/src/assertions';

describe('authForm selectors test: ', () => {
	proxyquire.noPreserveCache().noCallThru();
	let { store, state } = mockStore.default;
	const authForm = proxyquire('../../../src/modules/auth/selectors/auth-form', {
		'../../../store': store
	});

	beforeEach(() => {
		store.clearActions();
	});
	afterEach(() => {
		store.clearActions();
	});

	it(`should handle a register form`, () => {
		state.auth = {
			err: null,
			selectedAuthType: 'register'
		};
		// console.log(authForm.default());
		assertions.authForm(authForm.default());
	});

	it(`should handle a login form`, () => {
		state.auth = {
			err: null,
			selectedAuthType: 'login'
		};
		// console.log(authForm.default());
		assertions.authForm(authForm.default());
	});

	it(`should handle a unrecognized authType`, () => {
		state.auth = {
			err: null,
			selectedAuthType: 'some incorrect value'
		};
		// console.log(authForm.default());
		assertions.authForm(authForm.default());
	});

	it(`should handle invalid user name or password`, () => {
		state.auth = {
			err: {
				code: INVALID_USERNAME_OR_PASSWORD
			},
			selectedAuthType: 'login'
		};
		// console.log(authForm.default());
		assertions.authForm(authForm.default());
	});

	it(`should handle username missing`, () => {
		state.auth = {
			err: {
				code: USERNAME_REQUIRED
			},
			selectedAuthType: 'login'
		};
		// console.log(authForm.default());
		assertions.authForm(authForm.default());
	});

	it(`should handle passwords not matching`, () => {
		state.auth = {
			err: {
				code: PASSWORDS_DO_NOT_MATCH
			},
			selectedAuthType: 'login'
		};
		// console.log(authForm.default());
		assertions.authForm(authForm.default());
	});

	it(`should handle passwords that are too short`, () => {
		state.auth = {
			err: {
				code: PASSWORD_TOO_SHORT,
				message: 'password is too short!'
			},
			selectedAuthType: 'login'
		};
		// console.log(authForm.default());
		assertions.authForm(authForm.default());
	});

	it(`should handle taken usernames`, () => {
		state.auth = {
			err: {
				code: USERNAME_TAKEN
			},
			selectedAuthType: 'login'
		};
		// console.log(authForm.default());
		assertions.authForm(authForm.default());
	});

	it(`should handle unrecognized errors gracefully`, () => {
		state.auth = {
			err: {
				code: 'unrecognized error',
				message: 'some error message'
			},
			selectedAuthType: 'login'
		};
		// console.log(authForm.default());
		assertions.authForm(authForm.default());
	});
});
