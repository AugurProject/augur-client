import { describe, it, afterEach } from 'mocha'
import { assert } from 'chai'
import BigNumber from 'bignumber.js'
import proxyquire from 'proxyquire'
import sinon from 'sinon'
import mocks from 'test/mockStore'
import { CANCEL_ORDER } from 'modules/transactions/constants/types'
import { BID, ASK } from 'modules/bids-asks/constants/bids-asks-types'

describe('modules/bids-asks/actions/cancel-order.js', () => {
  proxyquire.noPreserveCache().noCallThru()

  const { mockStore, actionCreator, state } = mocks
  const augur = {
    cancel: sinon.stub(),
    rpc: { gasPrice: 1 },
    tx: { BuyAndSellShares: { cancel: {} } },
    getTxGasEth: sinon.stub()
  }
  const updateOrderStatus = actionCreator()
  const cancelOrderModule = proxyquire('../../../src/modules/bids-asks/actions/cancel-order', {
    '../../../services/augurjs': {
      augur,
      abi: { bignum: sinon.stub().returns(new BigNumber('1', 10)) },
    },
    '../../bids-asks/actions/update-order-status': { updateOrderStatus }
  })

  const store = mockStore({
    ...state,
    transactionsData: {
      cancelTxn: {
        type: CANCEL_ORDER,
        data: {
          order: {
            id: '0xdbd851cc394595f9c50f32c1554059ec343471b49f84a4b72c44589a25f70ff3',
            type: BID
          },
          market: { id: 'testMarketID' },
          outcome: {}
        }
      }
    }
  })

  afterEach(() => {
    augur.cancel.reset()
    updateOrderStatus.reset()
    store.clearActions()
  })

  describe('cancelOrder', () => {
    it(`shouldn't dispatch if order doesn't exist`, () => {
      store.dispatch(cancelOrderModule.cancelOrder('nonExistingOrderID', 'testMarketID', BID))
      store.dispatch(cancelOrderModule.cancelOrder('0xdbd851cc394595f9c50f32c1554059ec343471b49f84a4b72c44589a25f70ff3', 'nonExistingMarketID', BID))
      store.dispatch(cancelOrderModule.cancelOrder('0xdbd851cc394595f9c50f32c1554059ec343471b49f84a4b72c44589a25f70ff3', 'testMarketID', ASK))

      assert.deepEqual(store.getActions(), [])
    })
  })
})
