import React from "react";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Polyline,
} from "@react-google-maps/api";
import { map } from "lodash";

const center = { lat: 23.2599, lng: 77.4126 };
function Maps(props) {
  const { stopsCoords } = props;
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCzeKu6QuHcqpfcW1_0ltH2ucvFxcHm8YM",
  });

  if (!isLoaded) {
    return "Loading...";
  }

  const getAllCoordsPolyline = () => {
    const polylineItems = map(stopsCoords, (item) => {
      return (
        <Polyline
          path={item}
          strokeColor="#0000FF"
          strokeOpacity={0.8}
          strokeWeight={2}
        />
      );
    });
    return polylineItems;
  };

  return (
    <div>
      <GoogleMap
        center={center}
        zoom={15}
        mapContainerStyle={{ width: "750px", height: "320px" }}
        options={{
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        <Marker position={center} />
        {getAllCoordsPolyline()}
      </GoogleMap>
    </div>
  );
}

export default Maps;
