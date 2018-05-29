/* eslint jsx-a11y/label-has-for: 0 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { createBigNumber } from 'utils/create-big-number'
import { ZERO } from 'modules/trade/constants/numbers'
import { SCALAR } from 'modules/markets/constants/market-types'
import { formatAttoRep, formatNumber } from 'utils/format-number'
import { augur } from 'services/augurjs'
import { ExclamationCircle as InputErrorIcon } from 'modules/common/components/icons'
import FormStyles from 'modules/common/less/form'
import Styles from 'modules/reporting/components/reporting-dispute-form/reporting-dispute-form.styles'
import ReportingDisputeProgress from 'modules/reporting/components/reporting-dispute-progress/reporting-dispute-progress'
import selectDisputeOutcomes from 'modules/reporting/selectors/select-dispute-outcomes'
import fillDisputeOutcomeProgress from 'modules/reporting/selectors/fill-dispute-outcome-progress'
import { isEqual } from 'lodash'

export default class ReportingDisputeForm extends Component {

  static propTypes = {
    market: PropTypes.object.isRequired,
    updateState: PropTypes.func.isRequired,
    stakeInfo: PropTypes.object.isRequired,
    addUpdateAccountDispute: PropTypes.func.isRequired,
    getDisputeInfo: PropTypes.func.isRequired,
    forkThreshold: PropTypes.object.isRequired,
    accountDisputeData: PropTypes.object,
    availableRep: PropTypes.string.isRequired,
  }

  static constructRepObject(raw) {
    const { ETHER } = augur.rpc.constants
    const adjRaw = raw

    return {
      formatted: formatAttoRep(createBigNumber(adjRaw, 10), { decimals: 4, roundUp: true }),
      fullAmount: createBigNumber(adjRaw, 10).dividedBy(ETHER).toFixed(),
    }
  }

  constructor(props) {
    super(props)

    this.state = {
      outcomes: [],
      inputStake: this.props.stakeInfo.displayValue || '',
      inputSelectedOutcome: '',
      selectedOutcome: '',
      selectedOutcomeName: '',
      disputeBondValue: '0',
      bnAvailableRep: createBigNumber(this.props.availableRep, 10),
      isMarketInValid: false,
      validations: {
        stake: false,
        selectedOutcome: null,
      },
      currentOutcome: {},
      scalarInputChoosen: false,
    }

    this.focusTextInput = this.focusTextInput.bind(this)
  }

  componentWillMount() {
    this.updateDisptueInfoState()
    if (this.props.accountDisputeData) {
      this.setAccountDisputeData(this.props.accountDisputeData)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.availableRep !== this.props.availableRep) return true
    return !isEqual(nextState, this.state)
  }

  componentWillUnmount() {
    const {
      addUpdateAccountDispute,
      market,
    } = this.props
    if (this.state.selectedOutcome !== '' || this.state.isMarketInValid) {
      addUpdateAccountDispute({
        marketId: market.id,
        selectedOutcome: this.state.selectedOutcome,
        selectedOutcomeName: this.state.selectedOutcomeName,
        isMarketInValid: this.state.isMarketInValid,
        validations: this.state.validations,
      })
    }
  }

  setAccountDisputeData(accountDisputeData) {
    const {
      stakeInfo,
      updateState,
    } = this.props
    if (stakeInfo && createBigNumber(stakeInfo.repValue).gt(ZERO)) {
      delete accountDisputeData.validations.stake
    }

    this.setState({
      isMarketInValid: accountDisputeData.isMarketInValid ? accountDisputeData.isMarketInValid : null,
      selectedOutcome: accountDisputeData.selectedOutcome ? accountDisputeData.selectedOutcome : '',
      selectedOutcomeName: accountDisputeData.selectedOutcomeName ? accountDisputeData.selectedOutcomeName : '',
      validations: accountDisputeData.validations,
    }, () => {
      updateState({
        isMarketInValid: this.state.isMarketInValid,
        selectedOutcome: this.state.selectedOutcome,
        selectedOutcomeName: this.state.selectedOutcomeName,
        validations: this.state.validations,
      })
    })
  }

  setMAXStake() {
    this.validateStake(this.calculateMaxRep(this.state.selectedOutcome))
  }

  updateDisptueInfoState() {
    const {
      accountDisputeData,
      getDisputeInfo,
      market,
      forkThreshold,
      availableRep,
    } = this.props

    this.setState({
      bnAvailableRep: createBigNumber(availableRep),
    })

    getDisputeInfo([market.id], (err, disputeInfos) => {
      if (err) return console.error(err)
      const disputeInfo = disputeInfos[0]
      const { bondSizeOfNewStake } = disputeInfo
      const disputeOutcomes = selectDisputeOutcomes(market, disputeInfo.stakes, bondSizeOfNewStake, forkThreshold)
        .map(o => fillDisputeOutcomeProgress(bondSizeOfNewStake, o))

      this.setState({
        outcomes: disputeOutcomes.filter(item => !item.tentativeWinning) || [],
        currentOutcome: disputeOutcomes.find(item => item.tentativeWinning) || {},
        disputeBondValue: bondSizeOfNewStake,
      })

      // outcomes need to be populated before validating saved data
      if (accountDisputeData) {
        this.validateSavedValues()
      }
    })
  }

  checkStake(stakeValue, updatedValidations, maxRepObject) {
    const bnStake = createBigNumber(stakeValue)

    if (stakeValue === '' || stakeValue == null || stakeValue === 0) {
      updatedValidations.stake = 'The stake field is required.'
    } else if (stakeValue < 0) {
      updatedValidations.stake = 'The stake field must be a positive value.'
    } else if (bnStake.gt(createBigNumber(maxRepObject.formatted.formattedValue, 10))) {
      updatedValidations.stake = `Max value is ${maxRepObject.formatted.full}`
    } else if (this.state.bnAvailableRep.lt(bnStake)) {
      updatedValidations.stake = `Desposit Stake is greater then your available amount`
    } else {
      delete updatedValidations.stake
    }
    return updatedValidations
  }

  validateSavedValues() {
    const { market } = this.props
    if (market.marketType === SCALAR) {
      if (!this.state.outcomes.find(o => o.id === this.state.selectedOutcome)) {
        this.validateScalar(this.state.selectedOutcome, 'outcome', market.minPrice, market.maxPrice, market.tickSize, this.state.isMarketInValid)
      }
    } else {
      this.validateOutcome(this.state.validations, this.state.selectedOutcome, this.state.selectedOutcomeName, this.state.isMarketInValid)
    }
  }

  validateStake(rawStakeObj) {
    const { updateState } = this.props
    const { ETHER } = augur.rpc.constants
    const updatedValidations = { ...this.state.validations }
    let completeStakeObj = rawStakeObj

    if (completeStakeObj.raw === '') {
      delete updatedValidations.stake
      this.setState({
        inputStake: completeStakeObj.raw,
        validations: updatedValidations,
      })
      updateState({
        validations: updatedValidations,
      })
      return
    }

    if (!completeStakeObj.formatted) {
      // convert user inputted value to attoRep
      const rep = createBigNumber(completeStakeObj.raw, 10).times(ETHER)
      const attoRep = createBigNumber(formatNumber(rep, { decimals: 4, roundUp: true }).formattedValue, 10)
      completeStakeObj = ReportingDisputeForm.constructRepObject(attoRep)
    }

    const maxInfo = this.calculateMaxRep(this.state.selectedOutcome)
    this.checkStake(completeStakeObj.formatted.formattedValue, updatedValidations, maxInfo)

    const newStake = { displayValue: completeStakeObj.formatted.formattedValue, repValue: completeStakeObj.fullAmount }
    if (completeStakeObj.formatted.formattedValue === maxInfo.formatted.formattedValue) {
      newStake.repValue = maxInfo.fullAmount
    }

    this.setState({
      inputStake: completeStakeObj.formatted.formattedValue,
      validations: updatedValidations,
    })

    updateState({
      validations: updatedValidations,
      stakeInfo: newStake,
    })
  }

  validateOutcome(validations, selectedOutcome, selectedOutcomeName, isMarketInValid) {
    const {
      stakeInfo,
      updateState,
    } = this.props
    const updatedValidations = { ...validations }
    updatedValidations.selectedOutcome = true
    delete updatedValidations.err
    let isInvalid = isMarketInValid

    // outcome with id of .5 means invalid
    if (selectedOutcome === '0.5') isInvalid = true

    this.checkStake(stakeInfo.repValue, updatedValidations, this.calculateMaxRep(selectedOutcome))

    this.setState({
      validations: updatedValidations,
      selectedOutcome,
      selectedOutcomeName: selectedOutcomeName.toString(),
      isMarketInValid: isInvalid,
      inputSelectedOutcome: '',
      scalarInputChoosen: false,
    })

    updateState({
      validations: updatedValidations,
      selectedOutcome,
      selectedOutcomeName: selectedOutcomeName.toString(),
      isMarketInValid: isInvalid,
    })
  }

  focusTextInput() {
    this.textInput.focus()
  }

  validateScalar(value, humanName, min, max, tickSize, isInvalid) {
    const {
      stakeInfo,
      updateState,
    } = this.props
    const updatedValidations = { ...this.state.validations }

    if (value === '') {
      this.focusTextInput()
    }

    if (isInvalid) {
      delete updatedValidations.err
      updatedValidations.selectedOutcome = true

    } else {
      const minValue = parseFloat(min)
      const maxValue = parseFloat(max)
      const valueValue = parseFloat(value)
      const bnValue = createBigNumber(value || 0)
      const bnTickSize = createBigNumber(tickSize)

      switch (true) {
        case value === '':
          updatedValidations.err = `The ${humanName} field is required.`
          break
        case isNaN(valueValue):
          updatedValidations.err = `The ${humanName} field must be a number.`
          break
        case (valueValue > maxValue || valueValue < minValue):
          updatedValidations.err = `Please enter a ${humanName} between ${min} and ${max}.`
          break
        case value === this.state.currentOutcome.id:
          updatedValidations.err = `Current tentative winning outcome.`
          break
        case bnValue.mod(bnTickSize).gt('0'):
          updatedValidations.err = `The ${humanName} field must be a multiple of ${tickSize}.`
          break
        default:
          delete updatedValidations.err
          updatedValidations.selectedOutcome = true
          break
      }
    }

    this.checkStake(stakeInfo.repValue, updatedValidations, this.calculateMaxRep())

    this.setState({
      inputSelectedOutcome: value,
      validations: updatedValidations,
      selectedOutcome: value,
      selectedOutcomeName: value ? value.toString() : '',
      isMarketInValid: isInvalid,
      scalarInputChoosen: true,
    })

    updateState({
      validations: updatedValidations,
      selectedOutcome: value,
      selectedOutcomeName: value ? value.toString() : '',
      isMarketInValid: isInvalid,
    })
  }

  calculateMaxRep(selectedOutcome) {
    const outcome = this.state.outcomes.find((o) => {
      const result = o.id === selectedOutcome
      return result
    })

    return ReportingDisputeForm.constructRepObject(outcome ? outcome.stakeRemaining : this.state.disputeBondValue)
  }


  render() {
    const {
      market,
      stakeInfo,
    } = this.props
    const s = this.state

    return (
      <ul className={classNames(Styles.ReportingDisputeForm__fields, FormStyles.Form__fields)}>
        <li>
          <label>
            <span>Tentative Winning Outcome</span>
          </label>
          <p>{s.currentOutcome.isInvalid ? 'Invalid' : s.currentOutcome.name }
            {market.marketType === SCALAR && !s.currentOutcome.isInvalid &&
              <label>{market.scalarDenomination}</label>
            }
          </p>
        </li>
        <li>
          <label>
            <span>Proposed Outcome</span>
          </label>
          <ul className={classNames(Styles.ReportingDisputeForm__table, FormStyles['Form__radio-buttons--per-line'])}>
            { s.outcomes.map(outcome => (
              <li key={outcome.id}>
                <button
                  className={classNames({ [`${FormStyles.active}`]: s.selectedOutcome === outcome.id })}
                  onClick={(e) => { this.validateOutcome(s.validations, outcome.id, outcome.name, false) }}
                >
                  { outcome.name === 'Indeterminate' ? 'Market Is Invalid' : outcome.name }
                </button>
                <ReportingDisputeProgress
                  key={outcome.id}
                  {...outcome}
                  isSelected={s.selectedOutcome === outcome.id}
                  tentativeStake={stakeInfo.displayValue}
                />
              </li>
            ))
            }
            { market.marketType === SCALAR &&
              <li className={FormStyles['field--inline']}>
                <ul className={classNames(Styles.ReportingDisputeForm__table__input, FormStyles['Form__radio-buttons--per-line'])}>
                  <li>
                    <button
                      className={classNames({ [`${FormStyles.active}`]: s.scalarInputChoosen })}
                      onClick={(e) => { this.validateScalar('', 'selected outcome', market.minPrice, market.maxPrice, market.tickSize, false) }}
                    />
                    <input
                      id="sr__input--outcome-scalar"
                      type="number"
                      ref={(input) => { this.textInput = input }}
                      min={market.minPrice}
                      max={market.maxPrice}
                      step={market.tickSize}
                      placeholder={market.scalarDenomination}
                      value={s.inputSelectedOutcome}
                      className={classNames({ [`${FormStyles['Form__error--field']}`]: s.validations.hasOwnProperty('err') && s.validations.selectedOutcome })}
                      onChange={(e) => { this.validateScalar(e.target.value, 'outcome', market.minPrice, market.maxPrice, market.tickSize, false) }}
                    />
                    <ReportingDisputeProgress
                      key="scalar_input_progress"
                      isSelected={s.scalarInputChoosen}
                      tentativeStake={stakeInfo.displayValue}
                      percentageComplete={0}
                      percentageAccount={0}
                      bondSizeCurrent={s.disputeBondValue}
                      stakeRemaining={s.disputeBondValue}
                      stakeCurrent="0"
                      accountStakeCurrent="0"
                    />
                  </li>
                  <li>
                    { s.validations.hasOwnProperty('err') &&
                      <span className={FormStyles.Form__error__space}>
                        {InputErrorIcon}{ s.validations.err }
                      </span>
                    }
                  </li>
                </ul>
              </li>
            }
          </ul>
        </li>
        <li className={FormStyles['field--short']}>
          <label>
            <span htmlFor="sr__input--stake">Deposit Stake</span>
          </label>
          <ul className={FormStyles['Form__radio-buttons--per-line-inline']}>
            <li>
              <input
                id="sr__input--stake"
                type="number"
                min="0"
                placeholder="0.0000 REP"
                value={s.inputStake}
                className={classNames(FormStyles.Form__input, { [`${FormStyles['Form__error--field']}`]: s.validations.hasOwnProperty('stake') && s.validations.selectedOutcome })}
                onChange={e => this.validateStake({ raw: e.target.value })}
              />
              { s.selectedOutcomeName && s.selectedOutcomeName.length > 0 &&
                <div className={Styles.ReportingDisputeForm__container}>
                  <button
                    className={classNames(Styles.ReportingDisputeForm__button, FormStyles['button--inline'])}
                    onClick={() => { this.setMAXStake() }}
                  >MAX
                  </button>
                </div>
              }
            </li>
            <li>
              { s.validations.hasOwnProperty('stake') && s.validations.stake.length &&
                <span className={FormStyles['Form__error--even']}>
                  {InputErrorIcon}{ s.validations.stake }
                </span>
              }
            </li>
          </ul>
        </li>
      </ul>
    )
  }
}
