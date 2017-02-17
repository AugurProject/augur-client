import React from 'react';
import Link from 'modules/link/components/link';

const Paginator = p => (
  <article className="paginator">
    <div className="pagination-control-container">
      <div className="pagination-group-1">
        {!!p.pagination && !!p.pagination.previousPageNum &&
          <Link
            {...p.pagination.previousPageLink}
            className="button"
          >
            <i className="fa fa-angle-left" />
          </Link>
        }
      </div>

      <div className="pagination-group-2">
        <span className="pagination-count">
          {`${p.pagination.startItemNum} - ${p.pagination.endItemNum}`} <strong>of</strong> {p.pagination.numUnpaginated}
        </span>
      </div>

      <div className="pagination-group-3">
        {!!p.pagination && !!p.pagination.nextPageNum &&
          <Link
            {...p.pagination.nextPageLink}
            className="button"
          >
            <i className="fa fa-angle-right" />
          </Link>
        }
      </div>
    </div>
  </article>
);

export default Paginator;
