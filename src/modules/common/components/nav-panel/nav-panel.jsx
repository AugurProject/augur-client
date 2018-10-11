import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import classNames from "classnames";

import parseQuery from "modules/routes/helpers/parse-query";
import makeQuery from "modules/routes/helpers/make-query";

import Styles from "modules/common/components/nav-panel/nav-panel.styles";

function makeSearch(location, param, value, isItemDefault) {
  const updatedSearch = parseQuery(location.search);

  if (isItemDefault) {
    delete updatedSearch[param];
  } else {
    updatedSearch[param] = value;
  }

  return makeQuery(updatedSearch);
}

export default function NavPanel({ items, location, selectedNav, param }) {
  return (
    <div className={Styles.NavPanel}>
      <aside className={Styles.NavPanel__controls}>
        {items.map(item => (
          <Link
            key={item.title}
            className={classNames(Styles.NavPanel__control, {
              [Styles["NavPanel__control--active"]]:
                selectedNav != null ? item.param === selectedNav : item.default
            })}
            to={{
              search: makeSearch(location, param, item.param, item.default)
            }}
          >
            <div className={Styles.NavPanel__icon}>{item.icon}</div>
            <span className={Styles.NavPanel__title}>{item.title}</span>
          </Link>
        ))}
      </aside>
    </div>
  );
}

NavPanel.propTypes = {
  location: PropTypes.object.isRequired,
  items: PropTypes.array.isRequired,
  param: PropTypes.string.isRequired,
  selectedNav: PropTypes.string
};
