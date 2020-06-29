import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { updateSearchParams, quakeFetch } from "../../../actions";
import axios from "axios";
import GeocoderResults from "./GeocoderResults";
import { setGps, getGps } from "../../../utils/UserLocation";

// STILL NEED TO CLEAN UP INPUT BY NOT ALLOWING ';'!!!!!!
// Also make sure when hitting enter to select first auto correct result or do so when leaving focus of input

function Geocoder({
  updateSearchParams,
  quakeFetch,
  placename,
  maxradiuskm,
  starttime,
  endtime,
  minmagnitude,
  maxmagnitude,
  latitude,
  longitude,
}) {
  const [encodedSearch, setEncodedSearch] = useState(""); // Holds the URI encoded search text

  const [geocodeResults, setGeocodeResults] = useState([]); // Holds array of autocomplete results from MapBox Geocode API

  const handleChanges = (e) => {
    e.preventDefault();

    updateSearchParams({
      name: e.target.name,
      value: e.target.value,
    });

    setEncodedSearch(encodeURI(e.target.value));
  };

  useEffect(() => {
    if (placename.length > 2) {
      axios
        .get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedSearch}.json?access_token=${process.env.REACT_APP_MAP_API_TOKEN}&autocomplete=true&limit=5`
        )
        .then((res) => {
          setGeocodeResults(res.data.features);
        })
        .catch((err) => {
          console.log("Error", err);
        });
    } else {
      clearResults(); // This gets rid of the mapped results
    }
  }, [encodedSearch]);

  const clearResults = () => {
    // Clears the array of autocomplete results getting rid of the list that renders
    setGeocodeResults([]);
  };

  const handleEnter = (e) => {
    // If the user hits enter instead of selecting a result, this function passes the first suggestion into state
    if (e.which === 13 || e.keyCode === 13) {
      e.preventDefault();
      if (geocodeResults.length > 1) {
        console.log(
          "LOGGING FEATURE COORDS: ",
          geocodeResults[0].place_name,
          geocodeResults[0].geometry.coordinates
        );
        updateSearchParams({
          name: "placename",
          value: geocodeResults[0].place_name,
        });

        updateSearchParams({
          name: "latitude",
          value: geocodeResults[0].geometry.coordinates[1],
        });

        updateSearchParams({
          name: "longitude",
          value: geocodeResults[0].geometry.coordinates[0],
        });

        clearResults();
      }
    }
  };

  const updateGeoLocation = (e) => {
    // e.preventDefault();
    setGeocodeResults([]);

    setGps(() => {
      const latestCoords = JSON.parse(getGps());

      if (latestCoords) {
        console.log("latestCordsLat", latestCoords.latitude);
        console.log("latestCordsLong", latestCoords.longitude);

        updateSearchParams({
          name: "placename",
          value: "Your Current Location",
        });

        updateSearchParams({
          name: "latitude",
          value: latestCoords.latitude,
        });

        updateSearchParams({
          name: "longitude",
          value: latestCoords.longitude,
        });

        quakeFetch(
          `&starttime=${starttime}&endtime=${endtime}&minmagnitude=${minmagnitude}&maxmagnitude=${maxmagnitude}&maxradiuskm=${maxradiuskm}&latitude=${latitude}&longitude=${longitude}`
        );
      }
    });
  };

  return (
    <div className="geocoder-container">
      <input
        role="search"
        type="search"
        name="placename"
        onChange={handleChanges}
        onKeyPress={handleEnter}
        value={placename}
        placeholder="Search"
        maxLength="256"
        className="geocode-input"
        aria-label="input location"
        autoComplete="off"
      />
      <button className="geo-location" onClick={() => updateGeoLocation()} />
      <aside className="geocoder-results">
        {geocodeResults.map((feature) => {
          return (
            <GeocoderResults
              key={feature.place_name}
              feature={feature}
              clearResults={clearResults}
            />
          );
        })}
      </aside>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    placename: state.searchReducer.placename,
    starttime: state.searchReducer.starttime,
    endtime: state.searchReducer.endtime,
    minmagnitude: state.searchReducer.minmagnitude,
    maxmagnitude: state.searchReducer.maxmagnitude,
    maxradiuskm: state.searchReducer.maxradiuskm,
    latitude: state.searchReducer.latitude,
    longitude: state.searchReducer.longitude,
  };
};

export default connect(mapStateToProps, {
  updateSearchParams,
  quakeFetch,
})(Geocoder);