import { promises } from "fs";

interface IntegrationHelpers {
  updateAccountAddress(address: string): void;
  findMarketId(marketDescription: string): void;
}

declare namespace Window {
  export const integrationHelpers:IntegrationHelpers;
}

interface IFlash {
  pushSeconds(numberOfSeconds: number): Promise<Boolean>;
  pushDays(numberOfDays: number): Promise<Boolean>;
  pushWeeks(numberOfWeeks: number): Promise<Boolean>;
  setTimestamp(timestamp: number): Promise<Boolean>;
  setMarketEndTime(marketId: string): Promise<Boolean>;
}

interface IMarket {
  endTime: number
}
