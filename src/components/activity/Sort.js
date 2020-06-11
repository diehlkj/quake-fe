import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { quakeSort } from "../../actions/index.js";

function Sort({ quakeSort, quakes, sortBy }) {

    const [sortClicked, setSortClicked] = useState(false);

    const handleChanges = (e)=>{
        e.preventDefault();
        sortBy=e.target.value;
        console.log(sortBy);
        quakeSort(sortBy, quakes);
        setSortClicked(false);
    }

    useEffect(() => {
      console.log('IN SORT.JS LOGGIN SORT STATE', sortBy);
    },[sortBy]);

    return (
        <div>
          <div className={!sortClicked ? "page-fade-off" : "page-fade-on"} onClick={() => setSortClicked((sortClicked) => !sortClicked)}></div>
          <div className="sort-bar" onClick={() => setSortClicked((sortClicked) => !sortClicked)}>
              <label for="sort">Sort Results</label>
          </div>
          <div className={!sortClicked ? "sort-input-closed" : "sort-input-open"}>
          <form className="sort-input">
            <p className="sort-text">Sort by:</p>
              <select className="sort-dropdown" name="sort" onChange={handleChanges}>
                  <option value="newest">Time: Newest First</option>
                  <option value="oldest">Time: Oldest First</option>
                  <option value="ascending magnitude">Magnitude: Lowest First</option>
                  <option value="descending magnitude">Magnitude: Highest First</option>
              </select>
          </form>
        </div>
      </div>
    )
}

const mapStateToProps = (state) => {
    return {
      sortBy: state.quakeReducer.sortBy,
      quakes: state.quakeReducer.quakes
    };
  };
  
  export default connect(mapStateToProps, {
    quakeSort,
  })(Sort);