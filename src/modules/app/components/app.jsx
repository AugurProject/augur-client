import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Routes from 'modules/app/components/routes';

import shouldComponentUpdatePure from 'utils/should-component-update-pure';
import debounce from 'utils/debounce';

import { tween } from 'shifty';

import TopBar from 'modules/app/components/top-bar';
import InnerNav from 'modules/app/components/inner-nav';
import SideNav from 'modules/app/components/side-nav';
import Origami from 'modules/app/components/origami-svg';
import Logo from 'modules/app/components/logo';

import MobileNavHamburgerIcon from 'modules/common/components/mobile-nav-hamburger-icon';
import MobileNavCloseIcon from 'modules/common/components/mobile-nav-close-icon';
import MobileNavBackIcon from 'modules/common/components/mobile-nav-back-icon';

import NavAccountIcon from 'modules/common/components/nav-account-icon';
import NavCreateIcon from 'modules/common/components/nav-create-icon';
import NavMarketsIcon from 'modules/common/components/nav-markets-icon';
import NavPortfolioIcon from 'modules/common/components/nav-portfolio-icon';
import NavReportingIcon from 'modules/common/components/nav-reporting-icon';

export const mobileMenuStates = {
  CLOSED: 0,
  SIDEBAR_OPEN: 1,
  CATEGORIES_OPEN: 2,
  KEYWORDS_OPEN: 3
};

export default class AppView extends Component {
  static propTypes = {
    url: PropTypes.string,
    keywords: PropTypes.array.isRequired,
    coreStats: PropTypes.array.isRequired,
    isMobile: PropTypes.bool.isRequired,
    updateIsMobile: PropTypes.func.isRequired,
    selectedTopic: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      mainMenu: { scalar: 0, open: false, currentTween: null },
      subMenu: { scalar: 0, open: false, currentTween: null },
      mobileMenuState: mobileMenuStates.CLOSED
    };

    this.shouldComponentUpdate = shouldComponentUpdatePure;

    this.handleWindowResize = debounce(this.handleWindowResize.bind(this));
    this.checkIfMobile = this.checkIfMobile.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleWindowResize);

    this.checkIfMobile();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.isMobile !== newProps.isMobile) {
      this.setState({
        mobileMenuState: mobileMenuStates.CLOSED,
        mainMenu: { scalar: 0, open: false },
        subMenu: { scalar: 0, open: false }
      });
    }
  }

  handleWindowResize() {
    this.checkIfMobile();
  }

  checkIfMobile() {
    // This method sets up the side bar's state + calls the method to attach the touch event handler for when a user is mobile
    // CSS breakpoint sets the value when a user is mobile
    const isMobile = window.getComputedStyle(document.body).getPropertyValue('--is-mobile').indexOf('true') !== -1;

    this.props.updateIsMobile(isMobile);
  }

  toggleMenuTween(menuKey, forceOpen, cb) {
    if (this.state[menuKey].currentTween) this.state[menuKey].currentTween.stop();

    let nowOpen = !this.state[menuKey].open;
    if ((typeof forceOpen) === 'boolean') nowOpen = forceOpen;

    const setMenuState = (newState) => {
      this.setState({
        [menuKey]: Object.assign({}, this.state[menuKey], newState)
      });
    };

    const baseMenuState = { open: nowOpen };
    const currentTween = tween({
      from: { value: this.state[menuKey].scalar },
      to: { value: (nowOpen ? 1 : 0) },
      duration: 500,
      easing: 'easeOutQuad',
      step: (newState) => {
        setMenuState(Object.assign({}, baseMenuState, { scalar: newState.value }));
      }
    }).then(
      () => {
        if (cb && (typeof cb) === 'function') cb();
        setMenuState({ locked: false, currentTween: null });
      }
    );
    setMenuState({ currentTween });
  }

  toggleMainMenu() {
    const { selectedTopic } = this.props;
    if (!this.state.mainMenu.open) {
      if (selectedTopic) this.toggleMenuTween('subMenu', true);
    } else {
      this.toggleMenuTween('subMenu', false);
    }
    this.toggleMenuTween('mainMenu');
  }

  mobileMenuButtonClick() {
    const menuState = this.state.mobileMenuState;
    switch (menuState) {
      case mobileMenuStates.CLOSED:
        this.setState({ mobileMenuState: mobileMenuStates.SIDEBAR_OPEN });
        break;
      default:
        this.setState({ mobileMenuState: menuState - 1 });
        break;
    }
  }

  renderMobileMenuButton() {
    const menuState = this.state.mobileMenuState;

    let icon = null;
    if (menuState === mobileMenuStates.CLOSED) icon = <MobileNavHamburgerIcon />;
    else if (menuState === mobileMenuStates.SIDEBAR_OPEN) icon = <MobileNavCloseIcon />;
    else if (menuState >= mobileMenuStates.CATEGORIES_OPEN) icon = <MobileNavBackIcon />;

    return (
      <button
        className="mobile-menu-nav-button"
        onClick={() => this.mobileMenuButtonClick()}
      >
        {icon}
      </button>
    );
  }

  render() {
    const p = this.props;
    const s = this.state;

    const innerNavProps = {
      categories: p.categories,
      selectedCategory: p.selectedCategory,
      keywords: p.keywords
    };

    const { mainMenu, subMenu } = this.state;

    let categoriesMargin;
    let keywordsMargin;

    if (!p.isMobile) {
      categoriesMargin = -110 + (110 * mainMenu.scalar);
      keywordsMargin = 110 * subMenu.scalar;
    }

    return (
      <main className="app-wrap">
        <section className="side-wrap">
          <Origami
            isMobile={p.isMobile}
            menuScalar={mainMenu.scalar}
          />
          <Logo />
          {this.renderMobileMenuButton()}
          <SideNav
            isMobile={p.isMobile}
            mobileShow={s.mobileMenuState === mobileMenuStates.SIDEBAR_OPEN}
            menuScalar={subMenu.scalar}
            menuData={[
              {
                title: 'Markets',
                icon: NavMarketsIcon,
                onClick: () => {
                  if (p.isMobile) {
                    this.setState({ mobileMenuState: mobileMenuStates.CATEGORIES_OPEN });
                  } else {
                    this.toggleMainMenu();
                  }
                },
                onBlur: () => this.toggleMainMenu()
              },
              {
                title: 'Create',
                iconName: 'nav-create-icon',
                icon: NavCreateIcon,
                onClick: () => {},
                onBlur: () => {}
              },
              {
                title: 'Portfolio',
                iconName: 'nav-portfolio-icon',
                icon: NavPortfolioIcon,
                onClick: () => {},
                onBlur: () => {}
              },
              {
                title: 'Reporting',
                iconName: 'nav-reporting-icon',
                icon: NavReportingIcon,
                onClick: () => {},
                onBlur: () => {}
              },
              {
                title: 'Account',
                iconName: 'nav-account-icon',
                icon: NavAccountIcon,
                onClick: () => {},
                onBlur: () => {}
              },
            ]}
          />
        </section>
        <section className="main-wrap">
          <section className="topbar-row">
            <TopBar
              isMobile={p.isMobile}
              stats={p.coreStats}
            />
          </section>
          <section
            className="maincontent-row"
            style={{ marginLeft: categoriesMargin }}
          >
            <InnerNav
              isMobile={p.isMobile}
              mobileMenuState={s.mobileMenuState}
              subMenuScalar={subMenu.scalar}
              onSelectCategory={(...args) => {
                p.selectCategory(...args);
                if (!p.isMobile && !subMenu.open) this.toggleMenuTween('subMenu', true);
                if (p.isMobile) this.setState({ mobileMenuState: mobileMenuStates.KEYWORDS_OPEN });
              }}
              {...innerNavProps}
            />
            <section
              className="maincontent"
              style={{ marginLeft: keywordsMargin }}
            >
              <Routes
                activeView={p.activeView}
              />
            </section>
          </section>
        </section>
      </main>
    );
  }
}
