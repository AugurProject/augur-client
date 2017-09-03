import Augur from 'augur.js';
import logError from 'utils/log-error';

export const connect = (env, callback) => {
  const options = {
    httpAddresses: [],
    wsAddresses: []
  };
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isEnvHttps = (env.gethHttpURL && env.gethHttpURL.split('//')[0] === 'https:');
  const isEnvWss = (env.gethWebsocketsURL && env.gethWebsocketsURL.split('//')[0] === 'wss:');
  if (env.gethHttpURL && (!isHttps || isEnvHttps)) options.httpAddresses.push(env.gethHttpURL);
  if (env.gethWebsocketsURL && (!isHttps || isEnvWss)) options.wsAddresses.push(env.gethWebsocketsURL);
  if (env.networkID) options.networkID = env.networkID;
  if (env.hostedNodeFallback) options.httpAddresses.push('https://eth9000.augur.net');
  if (env.hostedNodeFallback) options.wsAddresses.push('wss://ws9000.augur.net');
  Object.keys(env.debug).forEach((opt) => { augur.options.debug[opt] = env.debug[opt]; });
  if (env.loadZeroVolumeMarkets != null) augur.options.loadZeroVolumeMarkets = env.loadZeroVolumeMarkets;
  augur.connect(options, (vitals) => {
    if (!vitals) return callback('could not connect to ethereum:' + JSON.stringify(vitals));
    console.log('connected:', vitals);
    callback(null, vitals);
  });
};

export const reportingMarketsSetup = (sender, periodLength, branchID, callback = logError) => {
  const tools = augur.tools;
  tools.DEBUG = true;
  const accounts = augur.rpc.eth.accounts();

  // create an event (and market) of each type on the new branch
  const t = new Date().getTime() / 1000;
  const untilNextPeriod = periodLength - (parseInt(t, 10) % periodLength);
  const expDate = parseInt(t + untilNextPeriod + 1, 10);
  const expirationPeriod = Math.floor(expDate / periodLength);
  console.debug('\nCreating events/markets...');
  console.log('Next period starts at time', parseInt(t, 10) + untilNextPeriod + ' (' + untilNextPeriod + ' seconds to go)');
  console.log('Current timestamp:', parseInt(t, 10));
  console.log('Expiration time:  ', expDate);
  console.log('Expiration period:', expirationPeriod);
  callback(null, 1, branchID);
  tools.create_each_market_type(augur, branchID, expDate, (err, markets) => {
    if (err) return callback(err);
    callback(null, 2);
    const events = {};
    const types = Object.keys(markets);
    const numTypes = types.length;
    for (let i = 0; i < numTypes; ++i) {
      events[types[i]] = augur.api.Events.getMarketEvent({ market: markets[types[i]], index: 0 });
    }
    const eventID = events.binary;
    console.debug('Binary event:', events.binary);
    console.debug('Categorical event:', events.categorical);
    console.debug('Scalar event:', events.scalar);

    // make a single trade in each new market
    const password = process.env.GETH_PASSWORD;
    tools.make_order_in_each_market(augur, 1, markets, accounts[1], accounts[2], password, (err) => {
      if (err) return callback(err);
      callback(null, 3);

      // wait until the period after the new events expire
      tools.wait_until_expiration(augur, events.binary, (err) => {
        if (err) return callback(err);
        callback(null, 4);
        const periodLength = augur.reporting.getPeriodLength(augur.api.Events.getBranch(eventID));
        const expirationPeriod = Math.floor(augur.api.Events.getExpiration({ event: eventID }) / periodLength);
        tools.print_reporting_status(augur, eventID, 'Wait complete');
        console.log('Current period:', augur.reporting.getCurrentPeriod(periodLength));
        console.log('Expiration period + 1:', expirationPeriod + 1);
        callback(null, 5);

        // wait for second period to start
        augur.reporting.prepareToReport(branchID, periodLength, sender, (err, votePeriod) => {
          if (err) console.error('checkVotePeriod failed:', err);
          callback(null, 6);
          tools.print_reporting_status(augur, eventID, 'After checkVotePeriod');
          tools.checkTime(augur, branchID, eventID, periodLength, (err) => {
            if (err) console.error('checkTime failed:', err);
            callback(null, 7);
          });
        });
      });
    });
  });
};

// Setup a new branch and prep it for reporting tests:
// Add markets + events to it, trade in the markets, hit the Rep faucet
// (Note: requires augur.options.debug.tools = true and access to the rpc.personal API)
export const reportingTestSetup = (sender, periodLen, branchID, callback = logError) => {
  if (!augur.tools) return callback('augur.js needs augur.options.debug.tools=true to run reportingTestSetup');
  const tools = augur.tools;
  const constants = augur.constants;
  const periodLength = periodLen || 1200;
  tools.DEBUG = true;
  if (branchID) {
    return augur.api.Branches.getPeriodLength({ branch: branchID }, (branchPeriodLength) => {
      console.debug('Using branch', branchID, 'for reporting tests, reporting cycle length', branchPeriodLength);
      reportingMarketsSetup(sender, branchPeriodLength, branchID, callback);
    });
  }
  console.debug('Setting up new branch for reporting tests...');
  tools.setup_new_branch(augur, periodLength, constants.DEFAULT_BRANCH_ID, [sender], (err, newBranchID) => {
    if (err) return callback(err);
    reportingMarketsSetup(sender, periodLength, newBranchID, callback);
  });
};

export const augur = new Augur();
export const rpc = augur.rpc;
export const constants = augur.constants;
export const utils = augur.utils;
