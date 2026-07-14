import { useEffect, useRef, useState } from "react";
import axios from "axios";

// Helper to load external scripts dynamically
const loadScript = (url) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${url}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
};

function LocationPicker({ value, onChange }) {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search query & suggestion states for Leaflet fallback
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapType, setMapType] = useState("google"); // "google" | "leaflet"

  const mapRef = useRef(null);
  const googleAutocompleteRef = useRef(null);
  
  // Store initialized map & marker objects so we can move them
  const mapObject = useRef(null);
  const markerObject = useRef(null);

  // Default coordinates (New Delhi, India)
  const defaultCoords = { lat: 28.6139, lng: 77.2090 };
  const currentCoords = {
    lat: value?.latitude || defaultCoords.lat,
    lng: value?.longitude || defaultCoords.lng,
  };

  useEffect(() => {
    // 1. Fetch maps API key from backend config
    const fetchConfig = async () => {
      try {
        const baseUrl = window.location.hostname === "localhost" 
          ? "http://localhost:5000" 
          : "https://ecoshare-ai.onrender.com";
        const res = await axios.get(`${baseUrl}/api/config`);
        const key = res.data.googleMapsApiKey;
        setApiKey(key);
        
        if (key) {
          // Exists -> load Google maps
          await loadGoogleMaps(key);
        } else {
          // Missing API key -> Fallback to Leaflet
          setMapType("leaflet");
          await loadLeafletMaps();
        }
      } catch (err) {
        console.error("Config load error, falling back to Leaflet:", err);
        setMapType("leaflet");
        await loadLeafletMaps().catch(e => setError("Failed to load map engine."));
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // Initialize Map whenever mapType or loading state finishes
  useEffect(() => {
    if (loading) return;

    if (mapType === "google" && window.google) {
      initGoogleMap();
    } else if (mapType === "leaflet" && window.L) {
      initLeafletMap();
    }
  }, [loading, mapType]);

  // Handle value change triggers outside (e.g. from Parent when value is updated externally)
  useEffect(() => {
    if (loading) return;
    const lat = value?.latitude;
    const lng = value?.longitude;
    if (!lat || !lng) return;

    if (mapType === "google" && mapObject.current && markerObject.current) {
      const pos = new window.google.maps.LatLng(lat, lng);
      markerObject.current.setPosition(pos);
      mapObject.current.panTo(pos);
    } else if (mapType === "leaflet" && mapObject.current && markerObject.current) {
      markerObject.current.setLatLng([lat, lng]);
      mapObject.current.panTo([lat, lng]);
    }
  }, [value?.latitude, value?.longitude]);

  // ==========================================
  // GOOGLE MAPS IMPLEMENTATION
  // ==========================================
  const loadGoogleMaps = async (key) => {
    try {
      await loadScript(`https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`);
    } catch (e) {
      console.error("Google maps script loading failed, falling back to Leaflet", e);
      setMapType("leaflet");
      await loadLeafletMaps();
    }
  };

  const initGoogleMap = () => {
    if (!mapRef.current) return;

    const mapOptions = {
      center: currentCoords,
      zoom: 15,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#0b1528" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#0b1528" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#748ca3" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#10b981" }]
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#3b82f6" }]
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#16253b" }]
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#21344f" }]
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#64748b" }]
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#020c1b" }]
        }
      ],
      disableDefaultUI: false,
    };

    const map = new window.google.maps.Map(mapRef.current, mapOptions);
    mapObject.current = map;

    const marker = new window.google.maps.Marker({
      position: currentCoords,
      map: map,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
    });
    markerObject.current = marker;

    // Handle marker drag
    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      reverseGeocodeGoogle(pos.lat(), pos.lng());
    });

    // Auto-complete input
    const input = document.getElementById("places-autocomplete");
    if (input) {
      const autocomplete = new window.google.maps.places.Autocomplete(input);
      autocomplete.bindTo("bounds", map);
      googleAutocompleteRef.current = autocomplete;

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        const loc = place.geometry.location;
        map.setCenter(loc);
        map.setZoom(16);
        marker.setPosition(loc);

        parseGooglePlace(place);
      });
    }
  };

  const reverseGeocodeGoogle = (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        parseGooglePlace(results[0]);
      } else {
        console.error("Geocoder failed due to: " + status);
      }
    });
  };

  const parseGooglePlace = (place) => {
    const coords = place.geometry.location;
    const lat = coords.lat();
    const lng = coords.lng();
    
    let address = place.formatted_address || place.name || "";
    let city = "";
    let state = "";
    let pincode = "";

    if (place.address_components) {
      for (const component of place.address_components) {
        const types = component.types;
        if (types.includes("locality")) {
          city = component.long_name;
        } else if (types.includes("administrative_area_level_2") && !city) {
          city = component.long_name;
        } else if (types.includes("administrative_area_level_1")) {
          state = component.long_name;
        } else if (types.includes("postal_code")) {
          pincode = component.long_name;
        }
      }
    }

    // fallback mapping if city/state weren't retrieved
    if (!city) city = "Local Area";
    if (!state) state = "State";
    if (!pincode) pincode = "000000";

    onChange({
      address,
      city,
      state,
      pincode,
      latitude: lat,
      longitude: lng,
    });
  };

  // ==========================================
  // LEAFLET MAPS IMPLEMENTATION (FALLBACK)
  // ==========================================
  const loadLeafletMaps = async () => {
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    await loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js");
  };

  const initLeafletMap = () => {
    if (!mapRef.current || mapObject.current) return;

    const L = window.L;
    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false
    }).setView([currentCoords.lat, currentCoords.lng], 15);
    mapObject.current = map;

    // Dark tiles from CartoDB (perfect matching with EcoShare dark UI)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 20,
    }).addTo(map);

    const marker = L.marker([currentCoords.lat, currentCoords.lng], {
      draggable: true,
    }).addTo(map);
    markerObject.current = marker;

    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      reverseGeocodeLeaflet(pos.lat, pos.lng);
    });
  };

  const reverseGeocodeLeaflet = async (lat, lng) => {
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      if (res.data) {
        parseLeafletResult(res.data, lat, lng);
      }
    } catch (e) {
      console.error("OSM Geocoding failed:", e);
    }
  };

  const parseLeafletResult = (result, lat, lng) => {
    const address = result.display_name || "";
    const addrData = result.address || {};
    const city = addrData.city || addrData.town || addrData.village || addrData.suburb || "Local Area";
    const state = addrData.state || "State";
    const pincode = addrData.postcode || "000000";

    onChange({
      address,
      city,
      state,
      pincode,
      latitude: lat,
      longitude: lng,
    });
  };

  // OpenStreetMap Nominatim Suggestion Search
  const handleLeafletSearch = async (val) => {
    setSearchQuery(val);
    if (val.length < 3) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&q=${encodeURIComponent(val)}`
      );
      setSuggestions(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const selectLeafletSuggestion = (suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    
    // Update map/marker
    if (mapObject.current && markerObject.current) {
      mapObject.current.setView([lat, lng], 15);
      markerObject.current.setLatLng([lat, lng]);
    }
    
    parseLeafletResult(suggestion, lat, lng);
    setSearchQuery(suggestion.display_name);
    setSuggestions([]);
  };

  // ==========================================
  // GPS GEOLOCATION METHOD
  // ==========================================
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (mapType === "google" && mapObject.current && markerObject.current) {
          const latLng = new window.google.maps.LatLng(lat, lng);
          markerObject.current.setPosition(latLng);
          mapObject.current.setCenter(latLng);
          mapObject.current.setZoom(16);
          reverseGeocodeGoogle(lat, lng);
        } else if (mapType === "leaflet" && mapObject.current && markerObject.current) {
          markerObject.current.setLatLng([lat, lng]);
          mapObject.current.setView([lat, lng], 16);
          reverseGeocodeLeaflet(lat, lng);
        }
      },
      (error) => {
        alert("Unable to retrieve location. Make sure GPS permissions are enabled.");
      },
      { enableHighAccuracy: true }
    );
  };

  if (error) {
    return (
      <div style={{ padding: "16px", color: "var(--danger)", background: "rgba(239,68,68,0.1)", borderRadius: "10px" }}>
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Search Input Area */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <div style={{ flex: 1, position: "relative" }}>
          {mapType === "google" ? (
            <input
              id="places-autocomplete"
              type="text"
              placeholder="Search location using Google Places..."
              className="eco-input"
              style={{ background: "rgba(255,255,255,0.02)" }}
            />
          ) : (
            <>
              <input
                type="text"
                placeholder="Search location using OpenStreetMap..."
                value={searchQuery}
                onChange={(e) => handleLeafletSearch(e.target.value)}
                className="eco-input"
                style={{ background: "rgba(255,255,255,0.02)" }}
              />
              {isSearching && (
                <div style={{ position: "absolute", right: "12px", top: "14px" }} className="spinner" />
              )}
              {suggestions.length > 0 && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0,
                  background: "#0d1f3c", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px", zIndex: 10, maxHeight: "200px", overflowY: "auto",
                  marginTop: "4px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                }}>
                  {suggestions.map((s) => (
                    <div
                      key={s.place_id}
                      onClick={() => selectLeafletSuggestion(s)}
                      style={{
                        padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.04)",
                        fontSize: "0.85rem", color: "#cbd5e1"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(16,185,129,0.1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                      {s.display_name}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <button
          type="button"
          onClick={useCurrentLocation}
          style={{
            padding: "13px 20px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
            color: "#34d399", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
            fontSize: "0.88rem", fontWeight: "600", transition: "all 0.2s"
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(16,185,129,0.2)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(16,185,129,0.1)"; }}
        >
          🎯 GPS Location
        </button>
      </div>

      {/* Map Canvas */}
      <div style={{ position: "relative", width: "100%", height: "240px", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
        {loading && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(13,31,60,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5
          }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <div className="spinner" />
              <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Loading mapping engine...</span>
            </div>
          </div>
        )}
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Verification details fields preview (read-only / feedback) */}
      {value?.address && (
        <div className="fade-in" style={{
          padding: "14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "10px", fontSize: "0.82rem", color: "#cbd5e1"
        }}>
          <div style={{ marginBottom: "6px" }}>📍 <strong>Address:</strong> {value.address}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
            <div>🏙️ <strong>City:</strong> {value.city || "—"}</div>
            <div>🗺️ <strong>State:</strong> {value.state || "—"}</div>
            <div>📮 <strong>Pincode:</strong> {value.pincode || "—"}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "6px", color: "#64748b", fontSize: "0.75rem" }}>
            <div>Latitude: {value.latitude?.toFixed(5)}</div>
            <div>Longitude: {value.longitude?.toFixed(5)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationPicker;
