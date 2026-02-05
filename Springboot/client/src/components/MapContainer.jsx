import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

const defaultContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '16px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    overflow: 'hidden'
};

const MapContainer = ({
    apiKey = '', // Set this in your environment variables
    center = { lat: 18.5204, lng: 73.8567 },
    zoom = 14,
    onLocationSelect = null,
    markers = [],
    showCurrentLocation = true,
    trackingCollector = false,
    className = '',
    style = {}
}) => {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey
    });

    const [map, setMap] = useState(null);
    const [directions, setDirections] = useState(null);
    const [currentPos, setCurrentPos] = useState(center);
    const [selectedMarker, setSelectedMarker] = useState(null);

    // For Ola/Zomato style path tracking
    // For Ola/Zomato style path tracking
    const directionsCallback = useCallback((response) => {
        if (response !== null) {
            if (response.status === 'OK') {
                setDirections(response);
            } else {
                console.error('Directions request failed:', response.status);
            }
        }
    }, []);

    useEffect(() => {
        if (showCurrentLocation && navigator.geolocation && !trackingCollector) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setCurrentPos(pos);
                    if (onLocationSelect) {
                        onLocationSelect(pos);
                    }
                },
                () => console.log("Error fetching location")
            );
        }

        // Global handler for Google Maps Auth Failure
        window.gm_authFailure = () => {
            console.error("Google Maps Authentication Error");
            const mapDiv = document.querySelector('.gm-err-container');
            if (mapDiv) {
                mapDiv.innerHTML = '<div style="padding: 20px; color: red; text-align: center;">Google Maps API Error: potentially invalid key or billing issue.</div>';
            }
            alert("Google Maps API Error: The provided API Key is invalid or billing is not enabled. Please check your Google Cloud Console.");
        };
    }, [showCurrentLocation, trackingCollector]);

    const onLoad = useCallback(function callback(map) {
        setMap(map);
        // Fix for map not rendering correctly in modals
        setTimeout(() => {
            try {
                if (window.google) {
                    window.google.maps.event.trigger(map, "resize");
                    map.setCenter(trackingCollector && markers.length > 0 ? markers[0].position : currentPos);
                }
            } catch (e) {
                console.error("Map resize error", e);
            }
        }, 500);
    }, [currentPos, markers, trackingCollector]);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    const handleClick = (e) => {
        if (onLocationSelect) {
            const pos = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
            };
            setCurrentPos(pos);
            onLocationSelect(pos);
        }
    };

    if (loadError) {
        return <div style={{ height: '400px', padding: '2rem', textAlign: 'center', background: '#fee2e2', borderRadius: '16px', color: '#ef4444' }}>
            Error loading Google Maps
        </div>;
    }

    if (!isLoaded) return (
        <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '16px' }}>
            <div className="loader">Loading Live Maps...</div>
        </div>
    );

    // Identify start (collector) and end (pickup) for directions
    const collectorMarker = markers.find(m => m.label === "Collector");
    const pickupMarker = markers.find(m => m.label === "Pickup Location" || m.label === "Business Location");

    const finalContainerStyle = { ...defaultContainerStyle, ...style };

    return (
        <GoogleMap
            mapContainerStyle={finalContainerStyle}
            mapContainerClassName={className}
            center={trackingCollector && markers.length > 0 ? markers[0].position : currentPos}
            zoom={zoom}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleClick}
            options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                zoomControl: true,
                styles: [
                    {
                        "featureType": "poi",
                        "elementType": "labels",
                        "stylers": [{ "visibility": "off" }]
                    }
                ]
            }}
        >
            {trackingCollector && collectorMarker && pickupMarker && (
                <DirectionsService
                    options={{
                        destination: pickupMarker.position,
                        origin: collectorMarker.position,
                        travelMode: 'DRIVING'
                    }}
                    callback={directionsCallback}
                />
            )}

            {directions && (
                <DirectionsRenderer
                    options={{
                        directions: directions,
                        suppressMarkers: true, // We draw our own custom markers
                        polylineOptions: {
                            strokeColor: '#3b82f6',
                            strokeWeight: 5,
                            strokeOpacity: 0.8
                        }
                    }}
                />
            )}

            {/* User Location Marker (Circular pulse style) */}
            {!trackingCollector && (
                <Marker
                    position={currentPos}
                    icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 7,
                        fillColor: '#3b82f6',
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: '#ffffff',
                    }}
                />
            )}

            {/* Custom Markers for Tracking */}
            {markers.map((marker, index) => {
                const isCollector = marker.label === "Collector";
                return (
                    <Marker
                        key={index}
                        position={marker.position}
                        icon={isCollector ? {
                            url: 'https://cdn-icons-png.flaticon.com/512/3299/3299935.png', // Recycle Bin Icon
                            scaledSize: new google.maps.Size(40, 40),
                            anchor: new google.maps.Point(20, 20)
                        } : {
                            url: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Pickup Pin
                            scaledSize: new google.maps.Size(35, 35),
                            anchor: new google.maps.Point(17, 35)
                        }}
                        onClick={() => setSelectedMarker(marker)}
                        animation={isCollector ? google.maps.Animation.DROP : null}
                    />
                );
            })}

            {selectedMarker && (
                <InfoWindow
                    position={selectedMarker.position}
                    onCloseClick={() => setSelectedMarker(null)}
                >
                    <div style={{ padding: '8px', minWidth: '150px' }}>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#1e293b' }}>{selectedMarker.label}</h4>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{selectedMarker.details}</p>
                    </div>
                </InfoWindow>
            )}

            {!trackingCollector && (
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent map click
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                                (position) => {
                                    const pos = {
                                        lat: position.coords.latitude,
                                        lng: position.coords.longitude,
                                    };
                                    setCurrentPos(pos);
                                    if (onLocationSelect) {
                                        onLocationSelect(pos);
                                    }
                                    map.panTo(pos);
                                },
                                () => alert("Error fetching location. Please enable location services.")
                            );
                        } else {
                            alert("Geolocation is not supported by your browser");
                        }
                    }}
                    style={{
                        position: 'absolute',
                        bottom: '120px',
                        right: '10px',
                        background: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                        padding: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title="Show Your Location"
                >
                    <img src="https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-1x.png" alt="Locate Me" style={{ width: '18px', height: '18px', backgroundPosition: '-144px 0px' }} />
                </button>
            )}
        </GoogleMap>
    );
};

export default React.memo(MapContainer);
