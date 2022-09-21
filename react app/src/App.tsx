/* eslint-disable react-hooks/exhaustive-deps */
import "./App.css";

import {
  Circle,
  FeatureGroup,
  MapContainer,
  Marker,
  TileLayer,
} from "react-leaflet";

import Box from "@mui/material/Box";
import CloseIcon from "@mui/icons-material/Close";
import Fade from "@mui/material/Fade";
import IconButton from "@mui/material/IconButton";
import L from "leaflet";
import { LatLngExpression } from "leaflet";
import Paper from "@mui/material/Paper";
import React from "react";
import { useEffect } from "react";
import { usePapaParse } from "react-papaparse";

function App() {
  const containerRef = React.useRef(null);
  const groupRef = React.useRef(null);

  const bufferRadius = 20000;
  const fillOpacity = 0.5;
  const strokeOpacity = 0;
  const mapCenter: LatLngExpression = [14.5, 122];
  const zoom = 8;
  const maxZoom = 12;
  const minZoom = 6;
  const customIcon = new L.Icon({
    iconUrl: require("./marker.png"),
    iconSize: new L.Point(18, 15),
  });

  const { readRemoteFile } = usePapaParse();
  const [stations, setStations] = React.useState<any>([]);
  const [checked, setChecked] = React.useState(false);
  const [highlight, setHighlight] = React.useState<any>(null);
  const [values, setValues] = React.useState<any>(null);
  const [map, setMap] = React.useState<any>(null);

  const url =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQcuVE7J9YLh5q8cy0QlFVJCKQ1VTxwywwVmtKA52vWIf-I62jCL0NrFnyEHGdLbPqXrqN7Y8rUtCT-/pub?output=csv";

  useEffect(() => {
    readRemoteFile(url, {
      complete: (results) => {
        results.data.shift();
        setStations(results.data);
      },
      download: true,
    });
    console.log(groupRef);
  }, []);

  useEffect(() => {
    if (!!highlight) {
      highlight.setStyle({
        color: "yellow",
        opacity: 1,
      });
    }
  }, [highlight]);

  const panel = (
    <Paper sx={{ width: "50px", height: "200px" }} elevation={3}>
      {!!values ? (
        <>
          <Box sx={{ m: 3, mt: 8 }}>
            <span style={{ fontWeight: 500, fontSize: "1.2rem" }}>
              {values[0]}
            </span>
            <br></br>
            Date: {values[15]}
            <br></br>
            Status: {values[2]}
            <br></br>
            Elevation: {values[5]}
            <br></br>
            Current Rainfall: {values[14]}mm
            <br></br>
            Total Rainfall: {values[10]}mm
            <br></br>
            Location: {values[6]}, {values[7]}, {values[8]}, {values[9]}
          </Box>
        </>
      ) : (
        <></>
      )}
      <IconButton
        aria-label="close"
        sx={{ position: "absolute", top: "10px", right: "10px" }}
        onClick={() => setChecked(false)}
      >
        <CloseIcon></CloseIcon>
      </IconButton>
    </Paper>
  );

  return (
    <div className="App">
      <Box>
        <MapContainer
          style={{ zIndex: 4 }}
          center={mapCenter}
          minZoom={minZoom}
          zoom={zoom}
          maxZoom={maxZoom}
          ref={setMap}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
          <FeatureGroup ref={groupRef}>
            {stations.map((value: any, index: any) => {
              let center: LatLngExpression = [
                parseFloat(value[3]),
                parseFloat(value[4]),
              ];

              let classif = parseFloat(value[11]);
              return(
                <div key={index}>
                  <Circle
                    center={center}
                    pathOptions={getColor(classif)}
                    radius={bufferRadius}
                    opacity={strokeOpacity}
                    fillOpacity={fillOpacity}
                    eventHandlers={{
                      click: (e) => {
                        highlightFeature(e, value);
                      },
                    }}
                  ></Circle>
                  <Marker position={center} icon={customIcon}></Marker>
                </div>
              );
            })}
          </FeatureGroup>
        </MapContainer>
        <Fade
          in={checked}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            width: "300px",
            height: "500px",
            zIndex: 4,
          }}
        >
          {panel}
        </Fade>
      </Box>
    </div>
  );

  function highlightFeature(event: any, values: any) {
    setChecked(true);
    let layer = event.sourceTarget;
    setHighlight(layer);
    setValues(values);

    // layer.setStyle({
    //   color: "yellow",
    //   opacity: 1,
    // });
    // let temp = counter;
    // temp++;
    // setCounter(temp);
  }

  function removehighlightFeature(event: any, rain: any) {
    setChecked((prev) => !prev);
    console.log(event);
    let layer = event.sourceTarget;
    layer.setStyle(getColor(rain));
  }

  function getColor(classif: number) {
    var colors = ["#38B75F", "#FCFD31", "#FFBD59", "#FE0100", "#313D39"];

    return { fillColor: colors[classif], color: colors[classif], opacity: 0 };
  }
}

export default App;
