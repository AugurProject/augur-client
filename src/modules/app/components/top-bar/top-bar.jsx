import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import { Notifications } from 'modules/common/components/icons/icons'
import NotificationsContainer from 'modules/notifications/container'

import Styles from 'modules/app/components/top-bar/top-bar.styles'

const TopBar = props => (
  <header className={Styles.TopBar}>
    {props.isLogged &&
      <section>
        <div className={Styles.TopBar__stats}>
          <div className={Styles.TopBar__stat}>
            <span className={Styles['TopBar__stat-label']}>ETH</span>
            <span className={Styles['TopBar__stat-value']}>
              {props.stats[0].totalRealEth.value.formatted}
            </span>
          </div>
          <div className={Styles.TopBar__stat}>
            <span className={Styles['TopBar__stat-label']}>REP</span>
            <span className={Styles['TopBar__stat-value']}>
              {props.stats[0].totalRep.value.formatted}
            </span>
          </div>
        </div>
        <div className={classNames(Styles.TopBar__stats, Styles.TopBar__performance)}>
          <div className={Styles.TopBar__stat}>
            <div
              className={Styles['TopBar__stat-label']}
              dangerouslySetInnerHTML={{ __html: `<span>30 Day P/L</span>` }}
            />
            <span className={Styles['TopBar__stat-value']}>
              123
            </span>
          </div>
          <div className={Styles.TopBar__stat}>
            <div
              className={Styles['TopBar__stat-label']}
              dangerouslySetInnerHTML={{ __html: `<span>1 Day P/L</span>` }}
            />
            <span className={Styles['TopBar__stat-value']}>
              123
            </span>
          </div>
        </div>
        <div className={Styles.TopBar__notifications}>
          <button
            className={Styles['TopBar__notification-icon']}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              props.toggleNotifications()
            }}
          >
            {Notifications(props.unseenCount)}
          </button>
          {props.isLogged && props.isNotificationsVisible &&
            <NotificationsContainer
              toggleNotifications={() => props.toggleNotifications()}
            />
          }
        </div>
      </section>
    }
    <span className={Styles['TopBar__logo-text']}>Augur</span>
  </header>
)

TopBar.propTypes = {
  isLogged: PropTypes.bool.isRequired,
  stats: PropTypes.array.isRequired,
  unseenCount: PropTypes.number.isRequired,
  isNotificationsVisible: PropTypes.bool.isRequired,
  toggleNotifications: PropTypes.func.isRequired,
  notifications: PropTypes.object
}

export default TopBar
