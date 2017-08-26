import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

import NullStateMessage from 'modules/common/components/null-state-message';
import Notification from 'modules/notifications/components/notification';

import getValue from 'utils/get-value';
import debounce from 'utils/debounce';

export default class NotificationsView extends Component {
  static propTypes = {
    notifications: PropTypes.object.isRequired,
    updateNotification: PropTypes.func.isRequired,
    removeNotification: PropTypes.func.isRequired,
    clearNotifications: PropTypes.func.isRequired,
    toggleNotifications: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      notificationsBounds: {},
      checkSeen: false
    };

    this.updateNotificationsBoundingBox = this.updateNotificationsBoundingBox.bind(this);
    this.setCheckSeen = debounce(this.setCheckSeen.bind(this), 100);
  }

  componentDidMount() {
    this.updateNotificationsBoundingBox();

    this.notifications && this.notifications.addEventListener('scroll', () => { this.setCheckSeen(true); });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.checkSeen && prevState.checkSeen !== this.state.checkSeen) this.setCheckSeen(false);
  }

  componentWillUnmount() {
    this.notifications && this.notifications.removeEventListener('scroll', this.setCheckSeen);
  }

  setCheckSeen(checkSeen) {
    this.setState({ checkSeen });
  }

  updateNotificationsBoundingBox() {
    if (this.notifications) this.setState({ notificationsBounds: this.notifications.getBoundingClientRect() });
  }

  render() {
    const p = this.props;
    const s = this.state;

    const notifications = getValue(p, 'notifications.notifications');
    const animationSpeed = parseInt(window.getComputedStyle(document.body).getPropertyValue('--animation-speed-normal'), 10);

    return (
      <section id="notifications_view">
        <div className="notifications-header">
          <h3>Notifications</h3>
          {!!notifications && !!notifications.length &&
            <button
              className="unstyled notifications-button-clear"
              onClick={(e) => {
                e.stopPropagation();
                p.clearNotifications();
              }}
            >
              clear all
            </button>
          }
        </div>
        {notifications && notifications.length ?
          <div
            ref={(notifications) => {
              this.notifications = notifications;
            }}
            className="notifications"
          >
            <CSSTransitionGroup
              component="div"
              transitionName="notification"
              transitionAppear
              transitionAppearTimeout={animationSpeed}
              transitionEnterTimeout={animationSpeed}
              transitionLeaveTimeout={animationSpeed}
            >
              {notifications.map((notification, i) => (
                <Notification
                  key={`${notification.id}-${notification.title}`}
                  removeNotification={() => p.removeNotification(i)}
                  toggleNotifications={p.toggleNotifications}
                  updateNotification={p.updateNotification}
                  notificationsBounds={s.notificationsBounds}
                  checkSeen={s.checkSeen}
                  updateNotificationsBoundingBox={this.updateNotificationsBoundingBox}
                  {...notification}
                />
              ))}
            </CSSTransitionGroup>
          </div> :
          <NullStateMessage message="No Notifications" />
        }
      </section>
    );
  }
}
