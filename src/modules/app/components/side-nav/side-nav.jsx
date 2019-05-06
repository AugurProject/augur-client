import React, { Component } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import PropTypes from "prop-types";

import makePath from "modules/routes/helpers/make-path";
import ConnectAccount from "modules/auth/containers/connect-account";
import GasPriceEdit from "modules/app/containers/gas-price-edit";
import ReactTooltip from "react-tooltip";
import TooltipStyles from "modules/common/less/tooltip.styles";

import { MARKETS } from "modules/routes/constants/views";
import Styles from "modules/app/components/side-nav/side-nav.styles";

export default class SideNav extends Component {
  static propTypes = {
    defaultMobileClick: PropTypes.func.isRequired,
    isMobile: PropTypes.bool.isRequired,
    isLogged: PropTypes.bool.isRequired,
    menuData: PropTypes.array.isRequired,
    mobileShow: PropTypes.bool.isRequired,
    stats: PropTypes.array.isRequired,
    currentBasePath: PropTypes.string
  };

  static defaultProps = {
    currentBasePath: null
  };

  constructor() {
    super();
    this.state = {
      selectedItem: null,
      selectedKey: null
    };
  }

  componentWillReceiveProps(newProps) {
    const { isMobile } = this.props;
    if (
      isMobile !== newProps.isMobile ||
      newProps.currentBasePath === MARKETS
    ) {
      this.setState({ selectedItem: null, selectedKey: null });
    }
  }

  isCurrentItem(item) {
    const { currentBasePath } = this.props;
    const selected =
      (this.state.selectedKey && this.state.selectedKey === item.title) ||
      item.route === currentBasePath;
    return selected;
  }

  itemClick(item) {
    const { isMobile } = this.props;
    const mobile = isMobile;
    if (!mobile && this.isCurrentItem(item)) return;
    const clickCallback = item.onClick;
    if (clickCallback && typeof clickCallback === "function") {
      clickCallback();
    }
    if (
      this.state.selectedItem &&
      this.state.selectedItem.onBlur &&
      typeof this.state.selectedItem.onBlur === "function"
    ) {
      this.state.selectedItem.onBlur();
    }

    // don't modify selected item if mobile
    // mobile menu state works differently
    if (mobile) return;

    // set title as key for equality check
    // because the state item de-syncs with
    // this.props.menuData's instance
    this.setState({ selectedItem: item, selectedKey: item.title });
  }

  render() {
    const {
      isMobile,
      isLogged,
      defaultMobileClick,
      menuData,
      mobileShow,
      stats
    } = this.props;

    const accessFilteredMenu = menuData.filter(
      item =>
        !(item.requireLogin && !isLogged) && !(item.onlyForMobile && !isMobile)
    );

    return (
      <aside
        className={classNames(Styles.SideNav, {
          [`${Styles.mobileShow}`]: mobileShow
        })}
      >
        <div className={Styles.SideNav__container}>
          <ul className={Styles.SideNav__nav}>
            {accessFilteredMenu.map((item, index) => {
              const Icon = item.icon;
              const selected = !isMobile && this.isCurrentItem(item);

              const linkClickHandler = () => {
                if (isMobile) {
                  if (item.mobileClick) {
                    item.mobileClick();
                  } else {
                    defaultMobileClick();
                  }
                } else {
                  this.itemClick(item);
                }
              };

              return (
                <li
                  className={classNames(
                    { [Styles["SideNav__item--selected"]]: selected },
                    item.disabled ? Styles.disabled : ""
                  )}
                  key={item.title}
                  id="side-nav-items"
                  data-tip={item.showCutoffTooltip}
                  data-for="tooltip--cutoff"
                >
                  <Link
                    to={item.route ? makePath(item.route) : null}
                    onClick={linkClickHandler}
                    disabled={item.disabled}
                  >
                    <Icon />
                    <span className={Styles["item-title"]}>{item.title}</span>
                  </Link>
                  {item.showCutoffTooltip &&
                    <ReactTooltip
                      id="tooltip--cutoff"
                      className={TooltipStyles.Tooltip}
                      effect="solid"
                      place="right"
                      type="light"
                    >
                      <p className={Styles.InnerTooltip}>
                        No new markets can be created due to the Augur v2 release phase. 
                        <span>
                          <a
                            href="http://docs.augur.net"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={Styles.ReadMore}
                          >
                            Read more
                          </a>
                        </span>
                      </p>
                    </ReactTooltip>
                  }
                </li>
              );
            })}
          </ul>
          {isLogged && (
            <div className={Styles.SideNav__hideForMidScreens}>
              <GasPriceEdit />
              <div className={Styles.SideNav__amt}>
                <div className={Styles.SideNav__nav__separator} />
                <div className={Styles.SideName__placement}>
                  <div className={Styles["SideNav__stat-label"]}>
                    {stats[1].totalPLMonth.label}
                    <span className={Styles["SideNav__stat-value"]}>
                      {stats[1].totalPLMonth.value.formatted}
                      <span className={Styles["SideNav__stat-unit"]}>ETH</span>
                    </span>
                  </div>
                  <div
                    className={Styles["SideNav__stat-label"]}
                    style={{ paddingBottom: "0" }}
                  >
                    {stats[1].totalPLDay.label}
                    <span className={Styles["SideNav__stat-value"]}>
                      {stats[1].totalPLDay.value.formatted}
                      <span className={Styles["SideNav__stat-unit"]}>ETH</span>
                    </span>
                  </div>
                </div>
              </div>
              <ConnectAccount />
            </div>
          )}
        </div>
      </aside>
    );
  }
}
