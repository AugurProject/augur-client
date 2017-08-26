import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import parseQuery from 'modules/app/helpers/parse-query';
import makeQuery from 'modules/app/helpers/make-query';

import { PAGINATION_PARAM_NAME } from 'modules/app/constants/param-names';

class Paginator extends Component {
  static propTypes = {
    itemsLength: PropTypes.number.isRequired,
    itemsPerPage: PropTypes.number.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    setSegment: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);

    this.state = {
      currentPage: null,
      lastPage: null,
      lowerBound: null,
      upperBound: null,
      backQuery: null,
      forwardQuery: null,
      totalItems: null
    };

    this.setCurrentSegment = this.setCurrentSegment.bind(this);
  }

  componentWillMount() {
    this.setCurrentSegment({
      lastPage: this.state.currentPage,
      lastLowerBound: this.state.lowerBound,
      lastUpperBound: this.state.upperBound,
      itemsLength: this.props.itemsLength,
      itemsPerPage: this.props.itemsPerPage,
      location: this.props.location,
      history: this.props.history,
      setSegment: this.props.setSegment
    });
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.itemsLength !== nextProps.itemsLength ||
      this.props.itemsPerPage !== nextProps.itemsPerPage ||
      this.props.location !== nextProps.location
    ) {
      this.setCurrentSegment({
        lastPage: this.state.currentPage,
        lastLowerBound: this.state.lowerBound,
        lastUpperBound: this.state.upperBound,
        itemsLength: nextProps.itemsLength,
        itemsPerPage: nextProps.itemsPerPage,
        location: nextProps.location,
        history: nextProps.history,
        setSegment: nextProps.setSegment
      });
    }
  }

  setCurrentSegment(options) {
    if (!options.itemsLength) return options.setSegment([]);

    const currentPage = parseInt(parseQuery(options.location.search)[PAGINATION_PARAM_NAME] || 1, 10);
    const lastPage = Math.ceil(options.itemsLength / options.itemsPerPage);

    // Pagination Direction
    // NOTE --  By deriving pagination direction, we can accomodate pages of results with varying length
    //          Example: First page has a 'hero' row of results
    //  -1 === Moving Down
    //  0 === No Movement
    //  1 === Moving Up
    let direction;
    if (options.lastPage === currentPage || options.lastPage == null) {
      direction = 0;
    } else if (options.lastPage < currentPage) {
      direction = 1;
    } else {
      direction = -1;
    }

    //  Segment Bounds (Blech, first round reasoning through)
    //  NOTE -- Bounds are one based
    //          Bounds are established thusly to accomodate deep linking + asymetric page lengths
    //    Rough Bounds Establishment
    //      Lower Bound
    let lowerBound;
    // If no last, do a simple check against itemsPerPage
    if (options.lastLowerBound === null) {
      if (currentPage === 1) {
        lowerBound = 1;
      } else {
        lowerBound = ((currentPage - 1) * options.itemsPerPage) + 1;
      }
    // If last, derive from previous bounds
    } else if (currentPage === 1) {
      lowerBound = 1;
    } else if (direction === 0) {
      lowerBound = options.lastLowerBound;
    } else if (direction === 1) {
      lowerBound = options.lastUpperBound + 1;
    } else {
      lowerBound = (options.lastLowerBound - options.itemsPerPage);
    }

    // In case page is out of bounds, redirect
    if (currentPage !== 1 && lowerBound > options.itemsLength) {
      let updatedSearch = parseQuery(options.location.search);
      delete updatedSearch[PAGINATION_PARAM_NAME];
      updatedSearch = makeQuery(updatedSearch);

      options.history.replace({
        ...options.location,
        search: updatedSearch
      });
      return;
    }

    //      Upper Bound
    let upperBound;
    // If no last, do a simple check against itemsPerPage
    if (options.lastUpperBound === null) {
      if (options.itemsLength < options.itemsPerPage || currentPage * options.itemsPerPage > options.itemsLength) {
        upperBound = options.itemsLength;
      } else {
        upperBound = currentPage * options.itemsPerPage;
      }
    // If last, derive from previous bounds
    } else if (options.itemsLength < options.itemsPerPage || currentPage * options.itemsPerPage > options.itemsLength) {
      upperBound = options.itemsLength;
    } else if (direction === 0) {
      upperBound = options.lastUpperBound;
    } else if (direction === 1) {
      upperBound = options.lastUpperBound + options.itemsPerPage;
    } else {
      upperBound = options.lastLowerBound - 1;
    }

    //    Precise Bounds Establishment (refinment of bounds)
    //      Lower Bound
    if (lowerBound <= 0) lowerBound = 1;
    //      Upper Bound
    if (upperBound - lowerBound !== options.itemsPerPage) {
      upperBound = (lowerBound - 1) + options.itemsPerPage;
    }
    if (upperBound > options.itemsLength) {
      upperBound = options.itemsLength;
    }

    //  Link Query Params
    //    Back
    let backQuery;
    if (currentPage === 1 || currentPage - 1 === 1) {
      const queryParams = parseQuery(options.location.search);
      delete queryParams[PAGINATION_PARAM_NAME];
      backQuery = makeQuery(queryParams);
    } else {
      const queryParams = parseQuery(options.location.search);
      queryParams[PAGINATION_PARAM_NAME] = currentPage - 1;
      backQuery = makeQuery(queryParams);
    }
    //    Forward
    let forwardQuery;
    if (currentPage * options.itemsPerPage >= totalItems) {
      const queryParams = parseQuery(options.location.search);
      queryParams[PAGINATION_PARAM_NAME] = currentPage;
      forwardQuery = makeQuery(queryParams);
    } else {
      const queryParams = parseQuery(options.location.search);
      queryParams[PAGINATION_PARAM_NAME] = currentPage + 1;
      forwardQuery = makeQuery(queryParams);
    }

    const totalItems = options.itemsLength;
    const boundedLength = (upperBound - lowerBound) + 1;

    this.setState({
      currentPage,
      lowerBound,
      upperBound,
      backQuery,
      forwardQuery,
      totalItems,
      lastPage
    });

    options.setSegment(lowerBound, upperBound, boundedLength);
  }

  render() {
    const p = this.props;
    const s = this.state;

    return (
      <article className="paginator">
        <div className="paginator-controls">
          <div className="paginator-back">
            {s.currentPage !== 1 &&
              <Link
                className="button"
                to={{
                  ...p.location,
                  search: s.backQuery
                }}
              >
                <i className="fa fa-angle-left" />
              </Link>
            }
          </div>

          <div className="paginator-location">
            <span>
              {s.lowerBound}{!!s.upperBound && s.upperBound > 1 && ` - ${s.upperBound}`} <strong>of</strong> {s.totalItems}
            </span>
          </div>

          <div className="paginator-forward">
            {s.currentPage !== s.lastPage &&
              <Link
                className="button"
                to={{
                  ...p.location,
                  search: s.forwardQuery
                }}
              >
                <i className="fa fa-angle-right" />
              </Link>
            }
          </div>
        </div>
      </article>
    );
  }
}

export default Paginator;
