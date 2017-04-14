import { describe, it, beforeEach, afterEach } from 'mocha';
import { assert } from 'chai';
import proxyquire from 'proxyquire';
import * as mockStore from 'test/mockStore';
import allMarkets from 'test/markets/selectors/markets-all-test';
import filteredMarkets from 'test/markets/selectors/markets-filtered-test';
import favoriteMarkets from 'test/markets/selectors/markets-favorite-test';

describe('modules/markets/selectors/markets-unpaginated', () => {
  proxyquire.noPreserveCache().noCallThru();
  const { store } = mockStore.default;
  const MarketsAll = () => allMarkets();

  const MarketsFiltered = {
    selectFilteredMarkets: () => filteredMarkets()
  };
  const MarketsFavorite = {
    selectFavoriteMarkets: () => favoriteMarkets()
  };
  const selector = proxyquire('../../../src/modules/markets/selectors/markets-unpaginated', {
    '../../../store': store,
    '../../markets/selectors/markets-all': MarketsAll,
    '../../markets/selectors/markets-filtered': MarketsFiltered,
    '../../markets/selectors/markets-favorite': MarketsFavorite
  });

  beforeEach(() => {
    store.clearActions();
  });

  afterEach(() => {
    store.clearActions();
  });

  it(`should return unpaginated markets`, () => {
    const actual = selector.default();
    const expected = [{
      isOpen: true,
      consensus: null,
      description: 'test 1',
      outcomes: [
        { name: 'outcome1' },
        { name: 'outcome2' }
      ],
      tags: [
        { name: 'testtag' },
        { name: 'tag' }
      ]
    }, {
      isOpen: true,
      consensus: null,
      description: 'test 2',
      outcomes: [
        { name: 'outcome3' },
        { name: 'outcome4' }
      ],
      tags: [
        { name: 'testtag' },
        { name: 'tag' }
      ]
    }];
    assert.deepEqual(actual, expected, `didn't produce the expected output`);
  });
});
