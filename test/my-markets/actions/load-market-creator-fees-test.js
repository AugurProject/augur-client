import { describe, it, before, after } from 'mocha';
import { assert } from 'chai';

import proxyquire from 'proxyquire';
import sinon from 'sinon';
import * as mockStore from 'test/mockStore';

import { abi } from 'services/augurjs';

describe('modules/my-markets/actions/load-market-creator-fees.js', () => {
  proxyquire.noPreserveCache().noCallThru();
  const { store } = mockStore.default;

  const mockAugurJS = {
    augur: {},
    abi
  };
  mockAugurJS.augur.getMarketCreatorFeesCollected = sinon.stub().yields('10');

  const mockActions = {
    updateMarketCreatorFees: () => {}
  };
  sinon.stub(mockActions, 'updateMarketCreatorFees', marketFees => ({
    type: 'TESTING',
    data: marketFees
  }));

  const action = proxyquire('../../../src/modules/my-markets/actions/load-market-creator-fees', {
    './update-market-creator-fees': mockActions,
    '../../../services/augurjs': mockAugurJS
  });

  before(() => {
    store.clearActions();

    store.dispatch(action.loadMarketCreatorFees('0x0000000000000000000000000000000000000001'));
  });

  after(() => {
    store.clearActions();
  });

  it(`should call augur's 'getMarketCreatorFeesCollected'`, () => {
    assert(mockAugurJS.augur.getMarketCreatorFeesCollected.calledOnce, `'augur.getMarketCreatorFeesCollected' wasn't called once as expected`);
  });

  it(`should dispatch 'updateMarketCreatorFees' with the correct object`, () => {
    const out = [{
      type: 'TESTING',
      data: {
        '0x0000000000000000000000000000000000000001': abi.bignum('10')
      }
    }];

    assert(mockActions.updateMarketCreatorFees.calledOnce, `'updateMarketCreatorFees' wasn't called once as expected`);
    assert.deepEqual(store.getActions(), out, `actions dispatched did not have the expected shape`);
  });
});
