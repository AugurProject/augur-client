import async from 'async'
import { augur } from 'services/augurjs'
import getReportingCycle from 'modules/universe/selectors/reporting-cycle'
import { updateUniverse } from 'modules/universe/actions/update-universe'
import { loadMarketsInfoIfNotLoaded } from 'modules/markets/actions/load-markets-info-if-not-loaded'
import logError from 'utils/log-error'
import { createBigNumber } from 'utils/create-big-number'

// Synchronize front-end universe state with blockchain universe state.
const syncUniverse = (callback = logError) => (dispatch, getState) => {
  const { universe, loginAccount } = getState()
  const universePayload = { tx: { to: universe.id } }
  // Getting current dispute fork threshold
  augur.api.Universe.getDisputeThresholdForFork(universePayload, (err, disputeThresholdForFork) => {
    if (err) return callback(err)
    const forkThreshold = createBigNumber(disputeThresholdForFork, 10)
    if (forkThreshold !== universe.forkThreshold) {
      dispatch(updateUniverse({ forkThreshold }))
    }
  })
  // Getting current fork data
  augur.api.Universe.getForkingMarket(universePayload, (err, forkingMarket) => {
    if (err) return callback(err)
    const isForking = forkingMarket !== '0x0000000000000000000000000000000000000000'
    if (isForking) {
      dispatch(loadMarketsInfoIfNotLoaded([forkingMarket]))
      async.parallel({
        forkEndTime: (next) => {
          augur.api.Universe.getForkEndTime(universePayload, (err, forkEndTime) => {
            if (err) return next(err)
            next(null, forkEndTime)
          })
        },
        isForkingMarketFinalized: (next) => {
          augur.api.Market.isFinalized({ tx: { to: forkingMarket } }, (err, isForkingMarketFinalized) => {
            if (err) return next(err)
            next(null, isForkingMarketFinalized)
          })
        },
        forkReputationGoal: (next) => {
          augur.api.Universe.getForkReputationGoal(universePayload, (err, forkReputationGoal) => {
            if (err) return next(err)
            next(null, forkReputationGoal)
          })
        },
      }, (err, universeData) => {
        if (err) return callback(err)
        if (universeData.isForkingMarketFinalized) {
          augur.api.Universe.getWinningChildUniverse(universePayload, (err, winningChildUniverse) => {
            if (err) return callback(err)
            updateUniverseIfForkingDataChanged(dispatch, universe, {
              ...universeData,
              forkingMarket,
              winningChildUniverse,
              isForking,
            })
          })
        } else {
          updateUniverseIfForkingDataChanged(dispatch, universe, { ...universeData, forkingMarket, isForking, winningChildUniverse: undefined })
        }
      })
    } else {
      updateUniverseIfForkingDataChanged(dispatch, universe, { isForking, forkingMarket, forkEndTime: undefined, isForkingMarketFinalized: undefined, winningChildUniverse: undefined })
    }
  })
  if (!universe.reportingPeriodDurationInSeconds) return callback(null)
  dispatch(updateUniverse(getReportingCycle()))
  if (universe.currentReportingWindowAddress && !loginAccount.address) {
    return callback(null)
  }
  console.log('syncing universe...')
  async.parallel({
    currentFeeWindowAddress: (next) => {
      augur.api.Universe.getCurrentFeeWindow(universePayload, (err, currentFeeWindowAddress) => {
        if (err) return next(err)
        next(null, currentFeeWindowAddress)
      })
    },
    nextFeeWindowAddress: (next) => {
      augur.api.Universe.getNextFeeWindow(universePayload, (err, nextFeeWindowAddress) => {
        if (err) return next(err)
        next(null, nextFeeWindowAddress)
      })
    },
  }, (err, universeReportingWindowData) => {
    if (err) return callback(err)
    dispatch(updateUniverse(universeReportingWindowData))
  })
}

function updateUniverseIfForkingDataChanged(dispatch, oldUniverseData, universeData) {
  if (
    oldUniverseData.id !== universeData.id ||
    oldUniverseData.isForking !== universeData.isForking ||
    oldUniverseData.forkingMarket !== universeData.forkingMarket ||
    oldUniverseData.forkEndTime !== universeData.forkEndTime ||
    oldUniverseData.isForkingMarketFinalized !== universeData.isForkingMarketFinalized ||
    oldUniverseData.winningChildUniverse !== universeData.winningChildUniverse
  ) {
    dispatch(updateUniverse(universeData))
  }
}

export default syncUniverse
