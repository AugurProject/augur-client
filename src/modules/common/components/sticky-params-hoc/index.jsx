import React from "react";
import PropTypes from "prop-types";

import { isEmpty, isString, pick, zipObject } from "lodash";
import parseQuery from "src/modules/routes/helpers/parse-query";
import makeQuery from "src/modules/routes/helpers/make-query";

/**
 * This is an wrapper around the link and redirect tag provided by react-router.
 *
 * We will need the location to get the current url parms.
 *
 * */
export const StickyParamsHOC = (Komponent, keysToMaintain) => {
  const StickyParamsCmp = ({
    children,
    location,
    to,
    staticContext,
    ...otherProps
  }) => {
    // Handle strings with url params.
    let toObj;
    if (isString(to)) {
      toObj = zipObject(["pathname", "search"], to.split("?"));

      if (isString(toObj.search)) {
        toObj.search = `?${toObj.search}`;
      } else {
        delete toObj.search;
      }
    } else {
      toObj = to;
    }

    const toSearchParams = parseQuery(toObj.search);
    const locationSearchParams = parseQuery(location.search);
    const pickedLocationSearchParams = pick(
      locationSearchParams,
      keysToMaintain
    );

    const searchParams = makeQuery({
      ...pickedLocationSearchParams,
      ...toSearchParams
    });

    if (!isEmpty(searchParams)) {
      toObj.search = `${searchParams}`;
    } else {
      delete toObj.search;
    }

    return (
      <Komponent to={toObj} {...otherProps}>
        {children}
      </Komponent>
    );
  };

  StickyParamsCmp.propTypes = {
    children: PropTypes.any,
    onClick: PropTypes.func,
    target: PropTypes.string,
    replace: PropTypes.bool,
    to: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        pathname: PropTypes.string,
        search: PropTypes.string,
        hash: PropTypes.string
      })
    ]).isRequired,
    location: PropTypes.object.isRequired,
    staticContext: PropTypes.any
  };

  return StickyParamsCmp;
};
