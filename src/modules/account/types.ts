import { ReactNode } from "react";

export interface DisputeInfo {
  disputeRound: number;
}

export interface MyPositionsSummary {
  currentValue: Object;
  numCompleteSets: Object;
  totalPercent: Object;
  totalReturns: Object;
}

export interface Market {
  id: string;
  description: string;
  reportingState: string;
  endTime: number;
  marketStatus: string;
  disputeInfo: DisputeInfo | null;
  myPositionsSummary: MyPositionsSummary | null;
  outstandingReturns: string | null;
}

export interface Notifications {
  type: string;
  isImportant: boolean;
  isNew: boolean;
  title: string;
  buttonLabel: string;
  buttonAction: Function;
  Template: ReactNode;
  market: Market | null;
  claimReportingFees?: Object;
}
