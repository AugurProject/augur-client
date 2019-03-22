import { createSelector } from "reselect";
import { selectBlockchainState } from "src/select-state";
import { formatNumber, formatPercent } from "utils/format-number";
import { createBigNumber } from "utils/create-big-number";

import { ZERO } from "modules/common-elements/constants";

export interface BlockchainState {
  highestBlockBn: number;
  lastProcessedBlockBn: number;
}

export const selectBlockInfoData = createSelector(
  selectBlockchainState,
  (blockchainState: any) => {
    if (blockchainState && blockchainState.lastProcessedBlock) {
      const { highestBlock, lastProcessedBlock } = blockchainState;
      const highestBlockBn = createBigNumber(highestBlock);
      const lastProcessedBlockBn = createBigNumber(lastProcessedBlock);

      const diff = highestBlockBn.minus(lastProcessedBlockBn);
      let blocksBehind = formatNumber(diff.toString()).roundedFormatted;

      blocksBehind = blocksBehind === "-" ? 0 : blocksBehind;

      const fullPercent = formatPercent(
        lastProcessedBlockBn
          .dividedBy(highestBlockBn)
          .times(createBigNumber(100))
          .toString(),
        { decimals: 2, decimalsRounded: 2 }
      );
      let percent = fullPercent.formattedValue;

      if (percent === 100 && diff.gt(ZERO)) {
        percent = 99.99;
      }

      return {
        percent,
        blocksBehind,
        highestBlockBn,
        lastProcessedBlockBn
      };
    }
    return null;
  }
);
