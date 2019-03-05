import React from "react";

import BoxHeader from "modules/portfolio/components/common/headers/box-header";
import { DepositButton, WithdrawButton, ViewTransactionsButton, REPFaucetButton } from "modules/common-elements/buttons";
import Styles from "modules/account/components/transactions/transactions-box.styles";
import { number } from "prop-types";

interface TransactionsBoxProps {
  isMainnet: boolean;
  eth: number | string;
  rep: number | string;
  gasPrice: string;
  repFaucet: Function;
  transferFunds: Function;
  withdrawReviewModal: Function;
  closeModal: Function;
}

export const TransactionsBox = (props: TransactionsBoxProps) =>
  <div className={Styles.TransactionsBox}>
    <BoxHeader title="Transactions" />
    <div className={Styles.TransactionsBoxContent}>
      <DepositButton  action={console.log} />
      <WithdrawButton action={console.log} />
      <p>View and download your transactions history here</p>
      <ViewTransactionsButton action={console.log} />
      {!props.isMainnet && (
        <div><REPFaucetButton action={props.repFaucet} /></div>
      )}
    </div>
  </div>;
