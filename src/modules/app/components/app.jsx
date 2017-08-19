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
    location: PropTypes.object.isRequired,
    url: PropTypes.string,
    coreStats: PropTypes.array.isRequired,
    isMobile: PropTypes.bool.isRequired,
    updateIsMobile: PropTypes.func.isRequired,
    selectedCategory: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      mainMenu: { scalar: 0, open: false, currentTween: null },
      subMenu: { scalar: 0, open: false, currentTween: null },
      keywordState: { loaded: false, openOnLoad: false },
      mobileMenuState: mobileMenuStates.CLOSED
    };

    this.shouldComponentUpdate = shouldComponentUpdatePure;

    this.handleWindowResize = debounce(this.handleWindowResize.bind(this), 25);
    this.checkIfMobile = this.checkIfMobile.bind(this);
  }

  componentDidMount() {
    // window.addEventListener('resize', this.handleWindowResize);

    this.checkIfMobile();
  }

  componentWillReceiveProps(nextProps) {
    // if (this.props.isMobile !== nextProps.isMobile) {
    //   this.setState({
    //     mobileMenuState: mobileMenuStates.CLOSED,
    //     mainMenu: { scalar: 0, open: false },
    //     subMenu: { scalar: 0, open: false }
    //   });
    // }

    // TODO: promise-ize instead of comparing states
    // if (this.props.keywords.length === 0 &&
    //     newProps.keywords.length > 0) {
    //   if (this.state.keywordState.openOnLoad) {
    //     if (this.props.isMobile) {
    //       this.setState({ mobileMenuState: mobileMenuStates.KEYWORDS_OPEN });
    //     } else {
    //       this.toggleMenuTween('subMenu', true);
    //     }
    //   }
    //   this.setState({ keywordState: { loaded: true, openOnLoad: false } });
    // }
    //
    // if (this.props.keywords.length > 0 &&
    //     newProps.keywords.length === 0) {
    //   if (!this.props.isMobile) {
    //     this.toggleMenuTween('subMenu', false);
    //   }
    //   this.setState({ keywordState: { loaded: false, openOnLoad: true } });
    // }

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
    const { selectedCategory } = this.props;
    // if (!this.state.mainMenu.open && selectedCategory && this.state.keywordState.loaded) {
    if (!this.state.mainMenu.open && selectedCategory) {
      this.toggleMenuTween('subMenu', true);
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
    // const s = this.state;
    //
    // const innerNavProps = {
    //   categories: p.categories,
    //   selectedCategory: p.selectedCategory
    // };
    //
    // const { mainMenu, subMenu } = this.state;
    //
    let categoriesMargin = 0;
    let keywordsMargin = 0;
    // let origamiScalar = 0;
    //
    // if (!p.isMobile) {
    //   categoriesMargin = -110 + (110 * mainMenu.scalar);
    //   keywordsMargin = 110 * subMenu.scalar;
    //
    //   // ensure origami fold-out moves perfectly with submenu
    //   origamiScalar = Math.max(0, (subMenu.scalar + mainMenu.scalar) - 1);
    // }

    return (
      <main className="app-wrap">
        <section className="side-wrap">

          <Logo />

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
            <section
              className="maincontent"
              style={{ marginLeft: keywordsMargin }}
            >

            </section>
          </section>
        </section>
      </main>
    );
  }
}
//
// <Origami
//   isMobile={p.isMobile}
//   menuScalar={origamiScalar}
// />

// <SideNav
//   isMobile={p.isMobile}
//   isLogged={p.isLogged}
//   mobileShow={s.mobileMenuState === mobileMenuStates.SIDEBAR_OPEN}
//   menuScalar={subMenu.scalar}
//   menuData={[
//     {
//       title: 'Markets',
//       icon: NavMarketsIcon,
//       onClick: () => {
//         if (p.isMobile) {
//           this.setState({ mobileMenuState: mobileMenuStates.CATEGORIES_OPEN });
//         } else {
//           this.toggleMainMenu();
//         }
//       },
//       onBlur: () => this.toggleMainMenu()
//     },
//     {
//       title: 'Create',
//       iconName: 'nav-create-icon',
//       icon: NavCreateIcon,
//       onClick: () => {},
//       onBlur: () => {},
//       requireLogin: true
//     },
//     {
//       title: 'Portfolio',
//       iconName: 'nav-portfolio-icon',
//       icon: NavPortfolioIcon,
//       onClick: () => {},
//       onBlur: () => {},
//       requireLogin: true
//     },
//     {
//       title: 'Reporting',
//       iconName: 'nav-reporting-icon',
//       icon: NavReportingIcon,
//       onClick: () => {},
//       onBlur: () => {},
//       requireLogin: true
//     },
//     {
//       title: 'Account',
//       iconName: 'nav-account-icon',
//       icon: NavAccountIcon,
//       onClick: () => {},
//       onBlur: () => {}
//     },
//   ]}
// />

// <InnerNav
//   isMobile={p.isMobile}
//   mobileMenuState={s.mobileMenuState}
//   subMenuScalar={subMenu.scalar}
//   onSelectCategory={(...args) => {
//     p.selectCategory(...args);
//     const { loaded } = this.state.keywordState;
//     this.setState({ keywordState: { openOnLoad: true, loaded } });
//   }}
//   {...innerNavProps}
// />

// {this.renderMobileMenuButton()}

// <Routes
//   activeView={p.activeView}
// />
