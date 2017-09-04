import { describe, it, afterEach } from 'mocha';
import { assert } from 'chai';
import { UPDATE_REPORTS, CLEAR_REPORTS } from 'modules/reports/actions/update-reports';
import testState from 'test/testState';
import reducer from 'modules/reports/reducers/reports';

describe(`modules/reports/reducers/reports.js`, () => {
  let action;
  let test;
  const testStateReports = Object.assign({}, testState.reports[testState.branch.id]);
  const state = Object.assign({}, testState);

  afterEach(() => {
    testState.reports[testState.branch.id] = Object.assign({}, testStateReports);
  });

  describe(`UPDATE_REPORTS`, () => {
    it('should update reports', () => {
      action = {
        type: UPDATE_REPORTS,
        reports: {
          [testState.branch.id]: {
            test: {
              eventID: 'test',
              example: 'example',
              isScalar: false,
              isIndeterminate: false
            },
            example: {
              eventID: 'example',
              test: 'test',
              isScalar: false,
              isIndeterminate: false
            }
          }
        }
      };
      const out = {
        [testState.branch.id]: {
          test: {
            eventID: 'test',
            example: 'example',
            isScalar: false,
            isIndeterminate: false
          },
          example: {
            eventID: 'example',
            test: 'test',
            isScalar: false,
            isIndeterminate: false
          },
          testEventID: {
            eventID: 'testEventID',
            isScalar: false,
            isIndeterminate: false
          }
        }
      };
      test = reducer(state.reports, action);
      assert.deepEqual(test, out, `Didn't update report information`);
    });
  });

  describe('UPDATE_REPORT', () => {
    const test = t => it(t.description, () => t.assertions(reducer(t.state.reports, {
      type: 'UPDATE_REPORT',
      branchID: t.params.branchID,
      eventID: t.params.eventID,
      report: t.params.report
    })));
    test({
      description: 'no report data',
      params: {
        branchID: '0xb1',
        eventID: '0xe3',
        report: {}
      },
      state: {
        reports: {
          '0xb1': {
            '0xe1': {
              eventID: '0xe1',
              period: 6
            },
            '0xe2': {
              eventID: '0xe2',
              period: 7
            }
          }
        }
      },
      assertions: (reduced) => {
        assert.deepEqual(reduced, {
          '0xb1': {
            '0xe1': {
              eventID: '0xe1',
              period: 6
            },
            '0xe2': {
              eventID: '0xe2',
              period: 7
            },
            '0xe3': {
              eventID: '0xe3'
            }
          }
        });
      }
    });
    test({
      description: 'insert new report',
      params: {
        branchID: '0xb1',
        eventID: '0xe3',
        report: {
          period: 7
        }
      },
      state: {
        reports: {
          '0xb1': {
            '0xe1': {
              eventID: '0xe1',
              period: 6
            },
            '0xe2': {
              eventID: '0xe2',
              period: 7
            }
          }
        }
      },
      assertions: (reduced) => {
        assert.deepEqual(reduced, {
          '0xb1': {
            '0xe1': {
              eventID: '0xe1',
              period: 6
            },
            '0xe2': {
              eventID: '0xe2',
              period: 7
            },
            '0xe3': {
              eventID: '0xe3',
              period: 7
            }
          }
        });
      }
    });
    test({
      description: 'update existing report',
      params: {
        branchID: '0xb1',
        eventID: '0xe2',
        report: {
          period: 8,
          reportedOutcomeID: '2'
        }
      },
      state: {
        reports: {
          '0xb1': {
            '0xe1': {
              eventID: '0xe1',
              period: 6
            },
            '0xe2': {
              eventID: '0xe2',
              period: 7
            }
          }
        }
      },
      assertions: (reduced) => {
        assert.deepEqual(reduced, {
          '0xb1': {
            '0xe1': {
              eventID: '0xe1',
              period: 6
            },
            '0xe2': {
              eventID: '0xe2',
              period: 8,
              reportedOutcomeID: '2'
            }
          }
        });
      }
    });
    test({
      description: 'insert first report on branch',
      params: {
        branchID: '0xb1',
        eventID: '0xe1',
        report: {
          period: 7
        }
      },
      state: {
        reports: {}
      },
      assertions: (reduced) => {
        assert.deepEqual(reduced, {
          '0xb1': {
            '0xe1': {
              eventID: '0xe1',
              period: 7
            }
          }
        });
      }
    });
  });

  describe('CLEAR_OLD_REPORTS', () => {
    const test = t => it(t.description, () => t.assertions(reducer(t.state.reports, {
      type: 'CLEAR_OLD_REPORTS',
      branchID: t.state.branch.id,
      reportPeriod: t.state.branch.reportPeriod
    })));
    test({
      description: 'one old and one current report',
      state: {
        branch: {
          id: '0xb1',
          reportPeriod: 7
        },
        reports: {
          '0xb1': {
            '0xe1': {
              eventID: '0xe1',
              period: 6,
              marketID: '0xa1',
              reportedOutcomeID: '2',
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            },
            '0xe2': {
              eventID: '0xe2',
              period: 7,
              marketID: '0xa2',
              reportedOutcomeID: '2',
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            }
          }
        }
      },
      assertions: (reduced) => {
        assert.deepEqual(reduced, {
          '0xb1': {
            '0xe2': {
              eventID: '0xe2',
              period: 7,
              marketID: '0xa2',
              reportedOutcomeID: '2',
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            }
          }
        });
      }
    });
    test({
      description: 'one old and one current report, both uncommitted',
      state: {
        branch: {
          id: '0xb1',
          reportPeriod: 7
        },
        reports: {
          '0xb1': {
            '0xe1': {
              eventID: '0xe1',
              period: 6,
              marketID: '0xa1',
              reportedOutcomeID: null,
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            },
            '0xe2': {
              eventID: '0xe2',
              period: 7,
              marketID: '0xa2',
              reportedOutcomeID: null,
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            }
          }
        }
      },
      assertions: (reduced) => {
        assert.deepEqual(reduced, {
          '0xb1': {
            '0xe2': {
              eventID: '0xe2',
              period: 7,
              marketID: '0xa2',
              reportedOutcomeID: null,
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            }
          }
        });
      }
    });
    test({
      description: 'one old and one current report, old report committed',
      state: {
        branch: {
          id: '0xb1',
          reportPeriod: 7
        },
        reports: {
          '0xb1': {
            '0xe1': {
              eventID: '0xe1',
              period: 6,
              marketID: '0xa1',
              reportedOutcomeID: '2',
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            },
            '0xe2': {
              eventID: '0xe2',
              period: 7,
              marketID: '0xa2',
              reportedOutcomeID: null,
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            }
          }
        }
      },
      assertions: (reduced) => {
        assert.deepEqual(reduced, {
          '0xb1': {
            '0xe2': {
              eventID: '0xe2',
              period: 7,
              marketID: '0xa2',
              reportedOutcomeID: null,
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            }
          }
        });
      }
    });
    test({
      description: 'one old and one current report, old report committed and revealed',
      state: {
        branch: {
          id: '0xb1',
          reportPeriod: 7
        },
        reports: {
          '0xb1': {
            '0xe1': {
              eventID: '0xe1',
              period: 6,
              marketID: '0xa1',
              reportedOutcomeID: '2',
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            },
            '0xe2': {
              eventID: '0xe2',
              period: 7,
              marketID: '0xa2',
              reportedOutcomeID: null,
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            }
          }
        }
      },
      assertions: (reduced) => {
        assert.deepEqual(reduced, {
          '0xb1': {
            '0xe2': {
              eventID: '0xe2',
              period: 7,
              marketID: '0xa2',
              reportedOutcomeID: null,
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            }
          }
        });
      }
    });
    test({
      description: 'two old reports',
      state: {
        branch: {
          id: '0xb1',
          reportPeriod: 7
        },
        reports: {
          '0xb1': {
            '0xe1': {
              eventID: '0xe1',
              period: 6,
              marketID: '0xa1',
              reportedOutcomeID: '2',
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            },
            '0xe2': {
              eventID: '0xe2',
              period: 6,
              marketID: '0xa2',
              reportedOutcomeID: null,
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            }
          }
        }
      },
      assertions: (reduced) => {
        assert.deepEqual(reduced, {
          '0xb1': {}
        });
      }
    });
    test({
      description: 'two current reports',
      state: {
        branch: {
          id: '0xb1',
          reportPeriod: 7
        },
        reports: {
          '0xb1': {
            '0xe1': {
              eventID: '0xe1',
              period: 7,
              marketID: '0xa1',
              reportedOutcomeID: '2',
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            },
            '0xe2': {
              eventID: '0xe2',
              period: 7,
              marketID: '0xa2',
              reportedOutcomeID: null,
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            }
          }
        }
      },
      assertions: (reduced) => {
        assert.deepEqual(reduced, {
          '0xb1': {
            '0xe1': {
              eventID: '0xe1',
              period: 7,
              marketID: '0xa1',
              reportedOutcomeID: '2',
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            },
            '0xe2': {
              eventID: '0xe2',
              period: 7,
              marketID: '0xa2',
              reportedOutcomeID: null,
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            }
          }
        });
      }
    });
    test({
      description: 'two current reports and two old reports',
      state: {
        branch: {
          id: '0xb1',
          reportPeriod: 7
        },
        reports: {
          '0xb1': {
            '0xe1': {
              eventID: '0xe1',
              period: 6,
              marketID: '0xa1',
              reportedOutcomeID: '2',
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            },
            '0xe2': {
              eventID: '0xe2',
              period: 6,
              marketID: '0xa2',
              reportedOutcomeID: null,
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            },
            '0xe3': {
              eventID: '0xe3',
              period: 7,
              marketID: '0xa3',
              reportedOutcomeID: '2',
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            },
            '0xe4': {
              eventID: '0xe4',
              period: 7,
              marketID: '0xa4',
              reportedOutcomeID: null,
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            }
          }
        }
      },
      assertions: (reduced) => {
        assert.deepEqual(reduced, {
          '0xb1': {
            '0xe3': {
              eventID: '0xe3',
              period: 7,
              marketID: '0xa3',
              reportedOutcomeID: '2',
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            },
            '0xe4': {
              eventID: '0xe4',
              period: 7,
              marketID: '0xa4',
              reportedOutcomeID: null,
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            }
          }
        });
      }
    });
    test({
      description: 'two current reports and two old reports on branch 1, one current report and three old reports on branch 2',
      state: {
        branch: {
          id: '0xb1',
          reportPeriod: 7
        },
        reports: {
          '0xb1': {
            '0xe1': {
              eventID: '0xe1',
              period: 6,
              marketID: '0xa1',
              reportedOutcomeID: '2',
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            },
            '0xe2': {
              eventID: '0xe2',
              period: 6,
              marketID: '0xa2',
              reportedOutcomeID: null,
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            },
            '0xe3': {
              eventID: '0xe3',
              period: 7,
              marketID: '0xa3',
              reportedOutcomeID: '2',
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            },
            '0xe4': {
              eventID: '0xe4',
              period: 7,
              marketID: '0xa4',
              reportedOutcomeID: null,
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            }
          },
          '0xb2': {
            '0xe5': {
              eventID: '0xe5',
              period: 6,
              marketID: '0xa5',
              reportedOutcomeID: '2',
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            },
            '0xe6': {
              eventID: '0xe6',
              period: 6,
              marketID: '0xa6',
              reportedOutcomeID: null,
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            },
            '0xe7': {
              eventID: '0xe7',
              period: 6,
              marketID: '0xa7',
              reportedOutcomeID: '2',
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            },
            '0xe8': {
              eventID: '0xe8',
              period: 7,
              marketID: '0xa8',
              reportedOutcomeID: null,
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            }
          }
        }
      },
      assertions: (reduced) => {
        assert.deepEqual(reduced, {
          '0xb1': {
            '0xe3': {
              eventID: '0xe3',
              period: 7,
              marketID: '0xa3',
              reportedOutcomeID: '2',
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            },
            '0xe4': {
              eventID: '0xe4',
              period: 7,
              marketID: '0xa4',
              reportedOutcomeID: null,
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            }
          },
          '0xb2': {
            '0xe5': {
              eventID: '0xe5',
              period: 6,
              marketID: '0xa5',
              reportedOutcomeID: '2',
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            },
            '0xe6': {
              eventID: '0xe6',
              period: 6,
              marketID: '0xa6',
              reportedOutcomeID: null,
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            },
            '0xe7': {
              eventID: '0xe7',
              period: 6,
              marketID: '0xa7',
              reportedOutcomeID: '2',
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            },
            '0xe8': {
              eventID: '0xe8',
              period: 7,
              marketID: '0xa8',
              reportedOutcomeID: null,
              isScalar: false,
              isCategorical: false,
              isIndeterminate: false
            }
          }
        });
      }
    });
  });

  describe(`CLEAR_REPORTS`, () => {
    it('should clear all reports', () => {
      action = {
        type: CLEAR_REPORTS
      };
      const fakeState = {
        [testState.branch.id]: {
          test: {
            eventID: 'test',
            example: 'example',
            isScalar: false,
            isIndeterminate: false
          },
          example: {
            eventID: 'example',
            test: 'test',
            isScalar: false,
            isIndeterminate: false
          }
        }
      };
      test = reducer(fakeState, action);
      assert.deepEqual(test, {}, `Didn't clear reports correctly`);
    });
  });
});
