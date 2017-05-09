import { describe, it } from 'mocha';
import { assert } from 'chai';
import sinon from 'sinon';

import {
  generateOutcomePositionSummary,
  generateMarketsPositionsSummary,
  generatePositionsSummary
} from 'modules/my-positions/selectors/my-positions-summary';

import { formatEther, formatShares, formatNumber } from 'utils/format-number';

describe(`modules/my-positions/selectors/my-positions-summary.js`, () => {
  describe('default', () => {
    const proxyquire = require('proxyquire');
    proxyquire.noPreserveCache().noCallThru();

    const test = (t) => {
      it(t.description, () => {
        t.assertions();
      });
    };

    test({
      description: `should return null if there ARE NO markets with positions`,
      assertions: (store) => {
        const mockSelectMyPositions = sinon.stub().returns([]);

        const selector = proxyquire('../../../src/modules/my-positions/selectors/my-positions-summary', {
          './my-positions': mockSelectMyPositions
        });

        const actual = selector.default();

        const expected = null;

        assert.strictEqual(actual, expected, `Didn't return the expect object`);
      }
    });

    test({
      description: `should return the expected object if there ARE markets with positions AND no outcomes have position object`,
      assertions: (store) => {
        const mockSelectMyPositions = sinon.stub().returns([
          {
            id: '0xMARKETID1',
            myPositionsSummary: {
              numPositions: formatNumber(1, {
                decimals: 0,
                decimalsRounded: 0,
                denomination: 'Positions',
                positiveSign: false,
                zeroStyled: false
              }),
              qtyShares: formatShares(1),
              purchasePrice: formatEther(0.2),
              realizedNet: formatEther(0),
              unrealizedNet: formatEther(0),
              totalNet: formatEther(0)
            },
            outcomes: [{}]
          }
        ]);

        const selector = proxyquire('../../../src/modules/my-positions/selectors/my-positions-summary', {
          './my-positions': mockSelectMyPositions
        });

        const actual = selector.default();

        const expected = {
          numPositions: formatNumber(0, {
            decimals: 0,
            decimalsRounded: 0,
            denomination: 'Positions',
            positiveSign: false,
            zeroStyled: false
          }),
          qtyShares: formatShares(0),
          purchasePrice: formatEther(0),
          realizedNet: formatEther(0),
          unrealizedNet: formatEther(0),
          totalNet: formatEther(0),
          positionOutcomes: []
        };

        assert.deepEqual(actual, expected, `Didn't return the expect object`);
      }
    });
  });

  describe('generateOutcomePositionSummary', () => {
    const proxyquire = require('proxyquire');
    proxyquire.noPreserveCache().callThru();

    const test = (t) => {
      it(t.description, () => {
        t.assertions();
      });
    };

    test({
      description: `should return the expected value when account trades and adjusted positions are undefined`,
      assertions: () => {
        const actual = generateOutcomePositionSummary(undefined, undefined, 0.2, {});

        const expected = null;

        assert.strictEqual(actual, expected, `Didn't return the expected value`);
      }
    });

    test({
      description: `should return the expected value when account trades and adjusted positions are defined AND position is zero`,
      assertions: () => {
        const mockAugur = {
          augur: {
            calculateProfitLoss: sinon.stub().returns({
              realized: 10,
              unrealized: -1,
              meanOpenPrice: 0.2
            })
          }
        };

        const selector = proxyquire('../../../src/modules/my-positions/selectors/my-positions-summary', {
          '../../../services/augurjs': mockAugur
        });

        const actual = selector.generateOutcomePositionSummary(
          0,
          [{}],
          0.2,
          {}
        );

        const expected = {
          numPositions: formatNumber(1, {
            decimals: 0,
            decimalsRounded: 0,
            denomination: 'Positions',
            positiveSign: false,
            zeroStyled: false
          }),
          qtyShares: formatShares(0),
          purchasePrice: formatEther(0.2),
          realizedNet: formatEther(10),
          unrealizedNet: formatEther(-1),
          totalNet: formatEther(9),
          isClosable: false
        };

        // More verbose since a `deepEqual` can't properly check equality w/ objects containing functions
        assert.deepEqual(actual.numPositions, expected.numPositions, `Didn't return the expected object`);
        assert.deepEqual(actual.qtyShares, expected.qtyShares, `Didn't return the expected object`);
        assert.deepEqual(actual.purchasePrice, expected.purchasePrice, `Didn't return the expected object`);
        assert.deepEqual(actual.realizedNet, expected.realizedNet, `Didn't return the expected object`);
        assert.deepEqual(actual.unrealizedNet, expected.unrealizedNet, `Didn't return the expected object`);
        assert.deepEqual(actual.totalNet, expected.totalNet, `Didn't return the expected object`);
        assert.strictEqual(actual.isClosable, expected.isClosable, `Didn't return the expected value`);
        assert.isFunction(actual.closePosition, `Didn't return a function as expected`);
      }
    });

    test({
      description: `should return the expected value when account trades and adjusted positions are defined AND position is non-zero`,
      assertions: () => {
        const mockAugur = {
          augur: {
            calculateProfitLoss: sinon.stub().returns({
              realized: 10,
              unrealized: -1,
              meanOpenPrice: 0.2
            })
          }
        };

        const selector = proxyquire('../../../src/modules/my-positions/selectors/my-positions-summary', {
          '../../../services/augurjs': mockAugur
        });

        const actual = selector.generateOutcomePositionSummary(
          10,
          [{}],
          0.2,
          {}
        );

        const expected = {
          numPositions: formatNumber(1, {
            decimals: 0,
            decimalsRounded: 0,
            denomination: 'Positions',
            positiveSign: false,
            zeroStyled: false
          }),
          qtyShares: formatShares(10),
          purchasePrice: formatEther(0.2),
          realizedNet: formatEther(10),
          unrealizedNet: formatEther(-1),
          totalNet: formatEther(9),
          isClosable: true
        };

        // More verbose since a `deepEqual` can't properly check equality w/ objects containing functions
        assert.deepEqual(actual.numPositions, expected.numPositions, `Didn't return the expected object`);
        assert.deepEqual(actual.qtyShares, expected.qtyShares, `Didn't return the expected object`);
        assert.deepEqual(actual.purchasePrice, expected.purchasePrice, `Didn't return the expected object`);
        assert.deepEqual(actual.realizedNet, expected.realizedNet, `Didn't return the expected object`);
        assert.deepEqual(actual.unrealizedNet, expected.unrealizedNet, `Didn't return the expected object`);
        assert.deepEqual(actual.totalNet, expected.totalNet, `Didn't return the expected object`);
        assert.strictEqual(actual.isClosable, expected.isClosable, `Didn't return the expected value`);
        assert.isFunction(actual.closePosition, `Didn't return a function as expected`);
      }
    });
  });

  describe('generateMarketsPositionsSummary', () => {
    const test = (t) => {
      it(t.description, () => {
        t.assertions();
      });
    };

    test({
      description: `should return the expected value when markets are undefined`,
      assertions: () => {
        const actual = generateMarketsPositionsSummary([]);

        const expected = null;

        assert.strictEqual(actual, expected, `Didn't return the expected value`);
      }
    });

    test({
      description: `should return the expected object if there ARE markets with positions AND no outcomes have position object`,
      assertions: (store) => {
        const actual = generateMarketsPositionsSummary([
          {
            id: '0xMARKETID1',
            myPositionsSummary: {
              numPositions: formatNumber(1, {
                decimals: 0,
                decimalsRounded: 0,
                denomination: 'Positions',
                positiveSign: false,
                zeroStyled: false
              }),
              qtyShares: formatShares(1),
              purchasePrice: formatEther(0.2),
              realizedNet: formatEther(0),
              unrealizedNet: formatEther(0),
              totalNet: formatEther(0)
            },
            outcomes: [{}]
          }
        ]);

        const expected = {
          numPositions: formatNumber(0, {
            decimals: 0,
            decimalsRounded: 0,
            denomination: 'Positions',
            positiveSign: false,
            zeroStyled: false
          }),
          qtyShares: formatShares(0),
          purchasePrice: formatEther(0),
          realizedNet: formatEther(0),
          unrealizedNet: formatEther(0),
          totalNet: formatEther(0),
          positionOutcomes: []
        };

        assert.deepEqual(actual, expected, `Didn't return the expect object`);
      }
    });

    test({
      description: `should return the expected object if there ARE markets with positions AND outcomes have position`,
      assertions: (store) => {
        const actual = generateMarketsPositionsSummary([
          {
            id: '0xMARKETID1',
            myPositionsSummary: {
              numPositions: formatNumber(1, {
                decimals: 0,
                decimalsRounded: 0,
                denomination: 'Positions',
                positiveSign: false,
                zeroStyled: false
              }),
              qtyShares: formatShares(1),
              purchasePrice: formatEther(0.2),
              realizedNet: formatEther(0),
              unrealizedNet: formatEther(0),
              totalNet: formatEther(0)
            },
            outcomes: [
              {
                position: {
                  numPositions: formatNumber(1, {
                    decimals: 0,
                    decimalsRounded: 0,
                    denomination: 'Positions',
                    positiveSign: false,
                    zeroStyled: false
                  }),
                  qtyShares: formatShares(1),
                  purchasePrice: formatEther(0.2),
                  realizedNet: formatEther(10),
                  unrealizedNet: formatEther(-1),
                  totalNet: formatEther(9),
                  isClosable: true
                }
              }
            ]
          }
        ]);

        const expected = {
          numPositions: formatNumber(1, {
            decimals: 0,
            decimalsRounded: 0,
            denomination: 'Positions',
            positiveSign: false,
            zeroStyled: false
          }),
          qtyShares: formatShares(1),
          purchasePrice: formatEther(0),
          realizedNet: formatEther(10),
          unrealizedNet: formatEther(-1),
          totalNet: formatEther(9),
          positionOutcomes: [
            {
              position: {
                numPositions: formatNumber(1, {
                  decimals: 0,
                  decimalsRounded: 0,
                  denomination: 'Positions',
                  positiveSign: false,
                  zeroStyled: false
                }),
                qtyShares: formatShares(1),
                purchasePrice: formatEther(0.2),
                realizedNet: formatEther(10),
                unrealizedNet: formatEther(-1),
                totalNet: formatEther(9),
                isClosable: true
              }
            }
          ]
        };

        assert.deepEqual(actual, expected, `Didn't return the expected object`);
      }
    });
  });

  describe('generatePositionsSummary', () => {
    const test = (t) => {
      it(t.description, () => {
        t.assertions();
      });
    };

    test({
      description: `should return the expected object`,
      assertions: () => {
        const actual = generatePositionsSummary(10, 2, 0.2, 10, -1);

        const expected = {
          numPositions: formatNumber(10, {
            decimals: 0,
            decimalsRounded: 0,
            denomination: 'Positions',
            positiveSign: false,
            zeroStyled: false
          }),
          qtyShares: formatShares(2),
          purchasePrice: formatEther(0.2),
          realizedNet: formatEther(10),
          unrealizedNet: formatEther(-1),
          totalNet: formatEther(9)
        };

        assert.deepEqual(actual, expected, `Didn't return the expected value`);
      }
    });
  });
});
