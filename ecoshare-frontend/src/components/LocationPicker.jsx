import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../config/AuthContext";

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

  const { API_BASE } = useAuth();

  // Default coordinates (New Delhi, India)
  const defaultCoords = { lat: 28.6139, lng: 77.2090 };
  const currentCoords = {
    lat: value?.latitude || defaultCoords.lat,
    lng: value?.longitude || defaultCoords.lng,
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/config`);
        const key = res.data.googleMapsApiKey;
        
        if (key) {
          setMapType("google");
          await loadGoogleMaps(key);
        } else {
          setMapType("leaflet");
          await loadLeafletMaps();
        }
      } catch (err) {
        console.error("Config fetch error, using Leaflet fallback:", err);
        setMapType("leaflet");
        await loadLeafletMaps();
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // Initialize Maps engine when loaded
  useEffect(() => {
    if (loading) return;

    if (mapType === "google" && window.google) {
      initGoogleMap();
    } else if (mapType === "leaflet" && window.L) {
      initLeafletMap();
    }
  }, [loading, mapType]);

  // Update marker position if coordinates change externally
  useEffect(() => {
    if (loading) return;

    if (mapType === "google" && mapObject.current && markerObject.current) {
      const newPos = new window.google.maps.LatLng(currentCoords.lat, currentCoords.lng);
      markerObject.current.setPosition(newPos);
      mapObject.current.setCenter(newPos);
    } else if (mapType === "leaflet" && mapObject.current && markerObject.current) {
      markerObject.current.setLatLng([currentCoords.lat, currentCoords.lng]);
      mapObject.current.setView([currentCoords.lat, currentCoords.lng], mapObject.current.getZoom());
    }
  }, [value?.latitude, value?.longitude]);

  // ==========================================
  // GOOGLE MAPS ENGINE
  // ==========================================
  const loadGoogleMaps = async (key) => {
    try {
      await loadScript(`https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`);
    } catch (e) {
      console.error("Google maps script failed, using Leaflet:", e);
      setMapType("leaflet");
      await loadLeafletMaps();
    }
  };

  const initGoogleMap = () => {
    if (!mapRef.current) return;

    const mapOptions = {
      center: currentCoords,
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
      styles: [] // Light-themed default styles
    };

    const map = new window.google.maps.Map(mapRef.current, mapOptions);
    mapObject.current = map;

    const marker = new window.google.maps.Marker({
      position: currentCoords,
      map: map,
      draggable: true,
      title: "Drag to pin location"
    });
    markerObject.current = marker;

    // Draggable event
    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      reverseGeocodeGoogle(pos.lat(), pos.lng());
    });

    // Map Click event
    map.addListener("click", (e) => {
      marker.setPosition(e.latLng);
      reverseGeocodeGoogle(e.latLng.lat(), e.latLng.lng());
    });

    // Auto-complete setup
    const input = document.getElementById("places-autocomplete");
    if (input && window.google.maps.places) {
      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        componentRestrictions: { country: "in" },
        fields: ["geometry", "formatted_address", "address_components"]
      });
      googleAutocompleteRef.current = autocomplete;

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) {
          alert("Place not found, select from map");
          return;
        }

        const loc = place.geometry.location;
        marker.setPosition(loc);
        map.setCenter(loc);
        map.setZoom(16);

        // Parse address components
        const parsed = parseAddressComponentsGoogle(place);
        onChange({
          address: place.formatted_address,
          latitude: loc.lat(),
          longitude: loc.lng(),
          ...parsed
        });
      });
    }
  };

  const reverseGeocodeGoogle = (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        const place = results[0];
        const parsed = parseAddressComponentsGoogle(place);
        onChange({
          address: place.formatted_address,
          latitude: lat,
          longitude: lng,
          ...parsed
        });
      }
    });
  };

  const parseAddressComponentsGoogle = (place) => {
    let city = "", state = "", pincode = "";
    const components = place.address_components || [];
    components.forEach((c) => {
      if (c.types.includes("locality")) city = c.long_name;
      else if (c.types.includes("administrative_area_level_1")) state = c.long_name;
      else if (c.types.includes("postal_code")) pincode = c.long_name;
    });
    return { city, state, pincode };
  };

  // ==========================================
  // LEAFLET MAPS ENGINE (FALLBACK)
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
    if (!mapRef.current) return;

    const L = window.L;

    // Clear old container if it exists
    if (mapObject.current) {
      mapObject.current.remove();
      mapObject.current = null;
    }

    const center = [currentCoords.lat, currentCoords.lng];
    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false
    }).setView(center, 14);
    mapObject.current = map;

    // OpenStreetMap Light tiles (CartoDB Voyager)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 20
    }).addTo(map);

    const marker = L.marker(center, { draggable: true }).addTo(map);
    markerObject.current = marker;

    // Drag handler
    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      reverseGeocodeLeaflet(pos.lat, pos.lng);
    });

    // Map Click handler
    map.on("click", (e) => {
      marker.setLatLng(e.latlng);
      reverseGeocodeLeaflet(e.latlng.lat, e.latlng.lng);
    });
  };

  const reverseGeocodeLeaflet = async (lat, lng) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`;
      const res = await axios.get(url);
      if (res.data) {
        const parsed = parseAddressComponentsLeaflet(res.data.address);
        onChange({
          address: res.data.display_name,
          latitude: lat,
          longitude: lng,
          ...parsed
        });
        setSearchQuery(res.data.display_name);
      }
    } catch (e) {
      console.error("Reverse geocoding failed", e);
    }
  };

  const parseAddressComponentsLeaflet = (address) => {
    return {
      city: address.city || address.town || address.village || address.suburb || "",
      state: address.state || "",
      pincode: address.postcode || ""
    };
  };

  // Autocomplete search for Leaflet (Nominatim API)
  const handleLeafletSearch = async (val) => {
    setSearchQuery(val);
    if (!val || val.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&countrycodes=in&limit=5&addressdetails=1&accept-language=en`;
      const res = await axios.get(url);
      setSuggestions(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const selectLeafletSuggestion = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);

    if (mapObject.current && markerObject.current) {
      markerObject.current.setLatLng([lat, lng]);
      mapObject.current.setView([lat, lng], 16);
    }

    const parsed = parseAddressComponentsLeaflet(item.address);
    onChange({
      address: item.display_name,
      latitude: lat,
      longitude: lng,
      ...parsed
    });

    setSearchQuery(item.display_name);
    setSuggestions([]);
  };

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
      () => {
        alert("Unable to retrieve location. Make sure GPS permissions are enabled.");
      },
      { enableHighAccuracy: true }
    );
  };

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-xl border border-red-200">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Search Input Area */}
      <div className="flex gap-2.5 items-center">
        <div className="flex-1 relative">
          {mapType === "google" ? (
            <input
              id="places-autocomplete"
              type="text"
              placeholder="Search location using Google Places..."
              className="eco-input bg-slate-50"
            />
          ) : (
            <>
              <input
                type="text"
                placeholder="Search location using OpenStreetMap..."
                value={searchQuery}
                onChange={(e) => handleLeafletSearch(e.target.value)}
                className="eco-input bg-slate-50"
              />
              {isSearching && (
                <div className="absolute right-3.5 top-3.5 spinner w-4 h-4 border-2 border-slate-300 border-t-slate-800" />
              )}
              {suggestions.length > 0 && (
                <div className="absolute top-[100%] left-0 right-0 bg-white border border-slate-200 rounded-xl z-50 max-h-48 overflow-y-auto mt-1.5 shadow-xl">
                  {suggestions.map((s) => (
                    <div
                      key={s.place_id}
                      onClick={() => selectLeafletSuggestion(s)}
                      className="px-4 py-2.5 cursor-pointer border-b border-slate-100 text-xs text-slate-700 hover:bg-emerald-50 transition-colors"
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
          className="px-4 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors"
        >
          📍 GPS Location
        </button>
      </div>

      {/* Map Canvas */}
      <div className="w-full h-64 rounded-xl overflow-hidden border border-slate-200 relative">
        {loading && (
          <div className="absolute inset-0 bg-slate-50 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-1.5">
              <div className="spinner w-6 h-6 border-2 border-slate-200 border-t-slate-800" />
              <span className="text-[10px] text-slate-400 font-semibold">Initializing locator map...</span>
            </div>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </div>

      <p className="text-[10px] text-slate-400 text-center font-semibold">
        💡 Use search or drag the pin marker directly to set the exact pickup coordinates
      </p>
    </div>
  );
}

export default LocationPicker;
