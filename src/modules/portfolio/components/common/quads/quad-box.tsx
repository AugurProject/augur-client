import React, { ReactNode } from "react";

import BoxHeaderMobile from "modules/portfolio/components/common/headers/box-header--mobile";
import BoxHeader from "modules/portfolio/components/common/headers/box-header";
import { SquareDropdown } from "modules/common-elements/selection";
import { SearchBar } from "modules/common-elements/search";
import { NameValuePair, Market, Tab} from "modules/portfolio/types";

import Styles from "modules/portfolio/components/common/quads/filter-box.styles";

export interface QuadBoxProps {
  title: string,
  showFilterSearch: Boolean,
  search: string,
  sortByOptions:  Array<NameValuePair>,
  updateDropdown: Function,
  onSearchChange: Function,
  rows?: ReactNode,
  bottomBarContent: ReactNode,
  label?: string,
  isMobile?: Boolean,
}

const QuadBox = (props: QuadBoxProps) => (
  <div className={Styles.FilterBox}>
    {props.isMobile ? 
      <BoxHeaderMobile
        title={props.title}
        isMobile={props.isMobile} 
        rightContent={props.showFilterSearch &&
          <div className={Styles.FilterBox__right}>
            <SearchBar onChange={props.onSearchChange} label={props.label}/>
            {props.sortByOptions && <SquareDropdown
              options={props.sortByOptions}
              onChange={props.updateDropdown}
            />}
          </div>
        }  
        bottomBarContent={props.bottomBarContent} 
      /> :
      <BoxHeader 
        title={props.title}
        isMobile={props.isMobile} 
        rightContent={props.showFilterSearch &&
          <div className={Styles.FilterBox__right}>
            <SearchBar onChange={props.onSearchChange} label={props.label}/>
            {props.sortByOptions && <SquareDropdown
              options={props.sortByOptions}
              onChange={props.updateDropdown}
            />}
          </div>
        }  
        bottomBarContent={props.bottomBarContent} 
       />
     }
    <div className={Styles.FilterBox__content}>
      {props.rows}
    </div>
  </div>
);

export default QuadBox;
