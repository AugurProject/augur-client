import EdgeConnect from "modules/auth/containers/edge-connect";
import LedgerConnect from "modules/auth/containers/ledger-connect";
import MetaMaskConnect from "modules/auth/containers/metamask-connect";
import TrezorConnect from "modules/auth/containers/trezor";

import {
  Ledger,
  Edge,
  MetaMask,
  Trezor
} from "modules/common/components/icons";

export const PARAMS = {
  EDGE: "edge",
  LEDGER: "ledger",
  METAMASK: "metamask",
  TREZOR: "trezor"
};

export const WALLET_TYPE = {
  SOFTWARE: "software",
  HARDWARE: "hardware"
};

const DEFAULT_ITEM_INDEX = 0;

export const ITEMS = [
  {
    param: PARAMS.METAMASK,
    title: "Metamask / Web 3 Provider",
    icon: MetaMask,
    type: WALLET_TYPE.SOFTWARE
  },
  {
    param: PARAMS.LEDGER,
    title: "Ledger",
    icon: Ledger,
    type: WALLET_TYPE.HARDWARE
  },
  {
    param: PARAMS.TREZOR,
    title: "Trezor",
    icon: Trezor,
    type: WALLET_TYPE.HARDWARE
  }
];

if (!process.env.AUGUR_HOSTED) {
  ITEMS.unshift({
    param: PARAMS.EDGE,
    title: "Edge (Username & Password)",
    icon: Edge,
    type: WALLET_TYPE.SOFTWARE
  });
}

ITEMS[DEFAULT_ITEM_INDEX].default = true;

const VIEWS = {
  [PARAMS.LEDGER]: LedgerConnect,
  [PARAMS.METAMASK]: MetaMaskConnect,
  [PARAMS.TREZOR]: TrezorConnect
};

if (!process.env.AUGUR_HOSTED) {
  VIEWS[PARAMS.EDGE] = EdgeConnect;
}
export const getView = selectedNav =>
  VIEWS[selectedNav] || VIEWS[ITEMS[DEFAULT_ITEM_INDEX].param];
