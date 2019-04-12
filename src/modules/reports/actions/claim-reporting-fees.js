import { augur } from "services/augurjs";
import logError from "utils/log-error";
import { sumAndformatGasCostToEther } from "utils/format-number";
import { getGasPrice } from "modules/auth/selectors/get-gas-price";
import {
  CLAIM_STAKE_FEES,
  PENDING,
  SUCCESS,
  UNIVERSE_ID
} from "modules/common-elements/constants";
import {
  addPendingData,
  removePendingData
} from "modules/pending-queue/actions/pending-queue-management";

export const CLAIM_FEES_GAS_COST = 3000000;
export const CLAIM_WINDOW_GAS_COST = 210000;
export const CROWDSOURCER_BATCH_SIZE = 4;
export const FEE_WINDOW_BATCH_SIZE = 10;

export function claimReportingFeesForkedMarket(options, callback = logError) {
  return (dispatch, getState) => {
    const { loginAccount } = getState();
    const payload = {
      ...options,
      meta: loginAccount.meta,
      redeemer: loginAccount.address
    };

    augur.reporting.claimReportingFeesForkedMarket(payload, (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    });
  };
}

export function redeemStake(options, callback = logError) {
  return (dispatch, getState) => {
    const { loginAccount, universe } = getState();
    const universeId = universe.id || UNIVERSE_ID;
    const gasPrice = getGasPrice(getState());

    const {
      pendingId,
      onSent,
      onSuccess,
      onFailed,
      nonforkedMarkets,
      feeWindows,
      estimateGas
    } = options;

    pendingId && dispatch(addPendingData(pendingId, CLAIM_STAKE_FEES, PENDING));

    const reportingParticipants = [];
    nonforkedMarkets.forEach(nonforkedMarket => {
      if (nonforkedMarket.initialReporter) {
        reportingParticipants.push(nonforkedMarket.initialReporter);
      }
      nonforkedMarket.crowdsourcers.forEach(crowdsourcer => {
        reportingParticipants.push(crowdsourcer);
      });
    });

    const batches = batchContractIds(feeWindows, reportingParticipants);

    const payloads = batches.map(batch =>
      buildPayload({
        ...batch,
        pendingId,
        loginAccount,
        universeId,
        estimateGas,
        gasPrice,
        onSent,
        dispatch
      })
    );

    const promises = [];

    payloads.map(payload =>
      promises.push(
        new Promise((resolve, reject) =>
          runRedeemStakePaylod(
            {
              ...payload,
              onSuccess: resolve,
              onFailed: reject
            },
            resolve
          )
        )
      )
    );

    Promise.all(promises).then((gasCosts = [], failed = []) => {
      onSuccess &&
        onSuccess(
          sumAndformatGasCostToEther(gasCosts, { decimalsRounded: 4 }, gasPrice)
        );
      onFailed && failed.forEach(m => onFailed(m));
    });
  };

  function batchContractIds(feeWindows, reportingParticipants) {
    const batches = [];
    const feeWindowBatchSize = Math.ceil(
      feeWindows.length / FEE_WINDOW_BATCH_SIZE
    );
    const crowdsourcerBatchSize = Math.ceil(
      reportingParticipants.length / CROWDSOURCER_BATCH_SIZE
    );

    // max case, assuming 10 fee windows and 5 crowdsourcers can run in one tx.
    if (feeWindowBatchSize < 2 && crowdsourcerBatchSize < 2)
      return [{ feeWindows, reportingParticipants }];

    // fee windows
    for (let i = 0; i < feeWindowBatchSize; i++) {
      batches.push({
        feeWindows: feeWindows.slice(
          i * FEE_WINDOW_BATCH_SIZE,
          i * FEE_WINDOW_BATCH_SIZE + FEE_WINDOW_BATCH_SIZE
        ),
        reportingParticipants: []
      });
    }

    for (let i = 0; i < crowdsourcerBatchSize; i++) {
      batches.push({
        feeWindows: [],
        reportingParticipants: reportingParticipants.slice(
          i * CROWDSOURCER_BATCH_SIZE,
          i * CROWDSOURCER_BATCH_SIZE + CROWDSOURCER_BATCH_SIZE
        )
      });
    }

    return batches;
  }

  function buildPayload(options) {
    const {
      feeWindows = [],
      reportingParticipants = [],
      onSent,
      onSuccess,
      pendingId,
      dispatch,
      onFailed,
      universeId,
      loginAccount
    } = options;
    return {
      _feeWindows: feeWindows,
      _reportingParticipants: reportingParticipants,
      onSent: () => {
        onSent && onSent();
      },
      onSuccess: () => {
        pendingId &&
          dispatch(addPendingData(pendingId, CLAIM_STAKE_FEES, SUCCESS));
        onSuccess && onSuccess();
      },
      onFailed: () => {
        pendingId && dispatch(removePendingData(pendingId, CLAIM_STAKE_FEES));
        onFailed && onFailed();
      },
      tx: {
        to: universeId,
        estimateGas: !!options.estimateGas
      },
      meta: loginAccount.meta
    };
  }
}

function runRedeemStakePaylod(payload, callback) {
  augur.api.Universe.redeemStake(payload, (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
}
