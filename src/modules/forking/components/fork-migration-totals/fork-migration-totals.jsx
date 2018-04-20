import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Styles from 'modules/forking/components/fork-migration-totals/fork-migration-totals.styles'
import selectMigrateTotals from 'modules/reporting/selectors/select-migrated-totals'

const ForkMigrationTotal = ({ className, forkMigrationTotal }) => {
  const currentMigrated = forkMigrationTotal.rep.rounded ? forkMigrationTotal.rep.rounded : '0'
  const forkMigrationTotalName = forkMigrationTotal.name === 'Indeterminate' ? 'Invalid' : forkMigrationTotal.name

  return (
    <div className={className || Styles.ForkMigrationTotals__forkMigrationTotal}>
      <div className={Styles['ForkMigrationTotals__forkMigrationTotal-name']}>
        <span className={Styles['ForkMigrationTotals__forkMigrationTotal-name-text']}>
          {forkMigrationTotalName}
        </span>
        <span className={Styles['ForkMigrationTotals__forkMigrationTotal-rep-migrated']}>
          {currentMigrated} REP Migrated
        </span>
      </div>
      { forkMigrationTotal.winner &&
        <div className={Styles['ForkMigrationTotals__winning-forkMigrationTotal-message']}>
          Winning Universe
        </div>
      }
    </div>
  )
}

class ForkMigrationTotals extends Component {
  constructor(props) {
    super(props)

    this.state = {
      forkMigrationTotalWrapperHeight: 0,
      isOpen: false,
      forkMigrationTotalsMap: {},
    }

    this.showMore = this.showMore.bind(this)
  }

  componentWillMount() {
    this.getForkMigrationTotals()
  }

  getForkMigrationTotals() {
    const {
      getForkMigrationTotals,
    } = this.props
    getForkMigrationTotals((forkMigrationTotalsMap) => {
      this.setState({
        forkMigrationTotalsMap,
      })
    })
  }

  showMore() {
    const forkMigrationTotalWrapperHeight = this.state.isOpen ? 0 : `${this.forkMigrationTotalTable.clientHeight}px`

    this.setState({
      forkMigrationTotalWrapperHeight,
      isOpen: !this.state.isOpen,
    })
  }

  render() {
    const { forkMigrationTotalsMap } = this.state

    const { reportableOutcomes } = this.props.forkingMarket
    const forkMigrationTotals = selectMigrateTotals(reportableOutcomes, forkMigrationTotalsMap)

    const totalForkMigrationTotals = forkMigrationTotals.length
    const displayShowMore = totalForkMigrationTotals > 3
    const showMoreText = this.state.isOpen ? `- ${totalForkMigrationTotals - 3} less` : `+ ${totalForkMigrationTotals - 3} more`

    const forkMigrationTotalWrapperStyle = {
      minHeight: this.state.forkMigrationTotalWrapperHeight,
    }

    return (
      <div
        className={Styles.ForkMigrationTotals}
        style={forkMigrationTotalWrapperStyle}
      >
        { forkMigrationTotals.length > 0 &&
          <ForkMigrationTotal
            className={Styles['ForkMigrationTotals__height-sentinel']}
            forkMigrationTotal={forkMigrationTotals[0]}
          />
        }
        <div
          className={classNames(Styles['ForkMigrationTotals__forkMigrationTotals-container'], {
            [`${Styles['show-more']}`]: displayShowMore,
          })}
        >
          { displayShowMore &&
            <button
              className={Styles['ForkMigrationTotals__show-more']}
              onClick={this.showMore}
            >
              { showMoreText }
            </button>
          }
          <div
            ref={(forkMigrationTotalTable) => { this.forkMigrationTotalTable = forkMigrationTotalTable }}
            className={Styles.ForkMigrationTotals__forkMigrationTotals}
          >
            {forkMigrationTotals.length > 0 && forkMigrationTotals.map(forkMigrationTotal => (
              <ForkMigrationTotal
                key={forkMigrationTotal.id}
                forkMigrationTotal={forkMigrationTotal}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }
}

ForkMigrationTotals.propTypes = {
  universe: PropTypes.string.isRequired,
  forkingMarket: PropTypes.object.isRequired,
  getForkMigrationTotals: PropTypes.func.isRequired,
}

ForkMigrationTotal.propTypes = {
  forkMigrationTotal: PropTypes.object.isRequired,
  className: PropTypes.string,
}

export default ForkMigrationTotals
