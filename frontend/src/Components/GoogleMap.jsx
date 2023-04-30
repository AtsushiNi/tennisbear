import React from 'react'
import { GoogleMap as Map, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '400px',
  height: '400px'
};

const center = {
  lat: -3.745,
  lng: -38.523
};

const position = {
  lat: -3.7,
  lng: -38.5
};

function GoogleMap() {
  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAP_API_KEY}
    >
      <Map
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
      >
        <Marker
          position={position}
        />
      </Map>
    </LoadScript>
  )
}

export default React.memo(GoogleMap)
