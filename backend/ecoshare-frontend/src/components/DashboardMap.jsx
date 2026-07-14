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

function DashboardMap({ foods = [], ngos = [] }) {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [mapType, setMapType] = useState("google"); // "google" | "leaflet"
  
  const mapRef = useRef(null);
  const mapObject = useRef(null);
  const markersRef = useRef([]);

  // Delhi center coordinates as default viewpoint
  const defaultCenter = { lat: 28.6139, lng: 77.2090 };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const baseUrl = window.location.hostname === "localhost" 
          ? "http://localhost:5000" 
          : "https://ecoshare-ai.onrender.com";
        const res = await axios.get(`${baseUrl}/api/config`);
        const key = res.data.googleMapsApiKey;
        setApiKey(key);

        if (key) {
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

  // Initialize and populate markers whenever foods, ngos, or map engine loads
  useEffect(() => {
    if (loading) return;

    if (mapType === "google" && window.google) {
      initGoogleMap();
    } else if (mapType === "leaflet" && window.L) {
      initLeafletMap();
    }
  }, [loading, mapType, foods, ngos]);

  // ==========================================
  // GOOGLE MAPS ENGINE
  // ==========================================
  const loadGoogleMaps = async (key) => {
    try {
      await loadScript(`https://maps.googleapis.com/maps/api/js?key=${key}`);
    } catch (e) {
      console.error("Google maps script failed, using Leaflet:", e);
      setMapType("leaflet");
      await loadLeafletMaps();
    }
  };

  const initGoogleMap = () => {
    if (!mapRef.current) return;

    // Center map around Delhi or first donation/NGO
    let center = defaultCenter;
    if (foods.length > 0 && foods[0].latitude) {
      center = { lat: foods[0].latitude, lng: foods[0].longitude };
    } else if (ngos.length > 0 && ngos[0].latitude) {
      center = { lat: ngos[0].latitude, lng: ngos[0].longitude };
    }

    const mapOptions = {
      center,
      zoom: 12,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#0b1528" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#0b1528" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#748ca3" }] },
        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#10b981" }] },
        { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#3b82f6" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#16253b" }] },
        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#21344f" }] },
        { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#020c1b" }] }
      ]
    };

    const map = new window.google.maps.Map(mapRef.current, mapOptions);
    mapObject.current = map;
    
    // Clear previous markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();
    let hasPoints = false;

    // Add Food markers
    foods.forEach((food) => {
      if (!food.latitude || !food.longitude) return;

      const isExpired = new Date(food.expiryTime) < new Date();
      let iconColor = "green"; // Available
      let statusLabel = "Available";
      if (food.status === "Claimed") {
        iconColor = "orange";
        statusLabel = "Claimed";
      } else if (isExpired) {
        iconColor = "red";
        statusLabel = "Expired";
      }

      // Map color pin
      const pinUrl = `https://maps.google.com/mapfiles/ms/icons/${iconColor}-dot.png`;

      const marker = new window.google.maps.Marker({
        position: { lat: food.latitude, lng: food.longitude },
        map: map,
        icon: pinUrl,
        title: food.foodName,
      });

      markersRef.current.push(marker);
      bounds.extend(marker.getPosition());
      hasPoints = true;

      // Click for details
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="color: #0b1528; font-family: 'Inter', sans-serif; padding: 6px; min-width: 200px;">
            <h4 style="margin: 0 0 6px 0; font-size: 0.95rem; font-weight: 700; color: #0d1f3c;">🍱 ${food.foodName}</h4>
            <div style="font-size: 0.8rem; line-height: 1.4; color: #475569;">
              <div><strong>Donor:</strong> ${food.donorName}</div>
              <div><strong>Quantity:</strong> ${food.quantity} servings</div>
              <div><strong>Expires:</strong> ${new Date(food.expiryTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} (${new Date(food.expiryTime).toLocaleDateString("en-IN")})</div>
              <div><strong>Phone:</strong> +91 ${food.phone || "—"}</div>
              <div style="margin-top: 5px;"><strong>Status:</strong> <span style="font-weight: 700; color: ${iconColor === "green" ? "#10b981" : iconColor === "orange" ? "#fbbf24" : "#ef4444"}">${statusLabel}</span></div>
            </div>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${food.latitude},${food.longitude}" target="_blank" rel="noreferrer" style="display: block; margin-top: 10px; text-align: center; text-decoration: none; background: #10b981; color: white; padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 700;">🧭 Navigate (Get Directions)</a>
          </div>
        `
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });
    });

    // Add NGO markers
    ngos.forEach((ngo) => {
      if (!ngo.latitude || !ngo.longitude) return;

      const pinUrl = `https://maps.google.com/mapfiles/ms/icons/blue-dot.png`;

      const marker = new window.google.maps.Marker({
        position: { lat: ngo.latitude, lng: ngo.longitude },
        map: map,
        icon: pinUrl,
        title: ngo.ngoName,
      });

      markersRef.current.push(marker);
      bounds.extend(marker.getPosition());
      hasPoints = true;

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="color: #0b1528; font-family: 'Inter', sans-serif; padding: 6px; min-width: 200px;">
            <h4 style="margin: 0 0 6px 0; font-size: 0.95rem; font-weight: 700; color: #1e3a8a;">🏢 ${ngo.ngoName}</h4>
            <div style="font-size: 0.8rem; line-height: 1.4; color: #475569;">
              <div><strong>Contact Person:</strong> ${ngo.contactPerson}</div>
              <div><strong>Phone:</strong> ${ngo.phone}</div>
              <div><strong>Capacity:</strong> ${ngo.capacity} servings/day</div>
              <div><strong>Address:</strong> ${ngo.address || ngo.location}</div>
            </div>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${ngo.latitude},${ngo.longitude}" target="_blank" rel="noreferrer" style="display: block; margin-top: 10px; text-align: center; text-decoration: none; background: #3b82f6; color: white; padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 700;">🧭 Navigate (Get Directions)</a>
          </div>
        `
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });
    });

    // Zoom out map to contain all markers
    if (hasPoints && foods.length + ngos.length > 1) {
      map.fitBounds(bounds);
    }
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

    // Clear old map container if it was initialized
    if (mapObject.current) {
      mapObject.current.remove();
      mapObject.current = null;
    }

    let center = [defaultCenter.lat, defaultCenter.lng];
    if (foods.length > 0 && foods[0].latitude) {
      center = [foods[0].latitude, foods[0].longitude];
    } else if (ngos.length > 0 && ngos[0].latitude) {
      center = [ngos[0].latitude, ngos[0].longitude];
    }

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false
    }).setView(center, 12);
    mapObject.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 20,
    }).addTo(map);

    const leafletGroup = [];

    // Food Markers
    foods.forEach((food) => {
      if (!food.latitude || !food.longitude) return;

      const isExpired = new Date(food.expiryTime) < new Date();
      let colorClass = "available"; // CSS class for colors
      let statusLabel = "Available";
      let hexColor = "#10b981"; // green

      if (food.status === "Claimed") {
        colorClass = "claimed";
        statusLabel = "Claimed";
        hexColor = "#f59e0b"; // orange
      } else if (isExpired) {
        colorClass = "expired";
        statusLabel = "Expired";
        hexColor = "#ef4444"; // red
      }

      // Beautiful custom divIcon matching Dark Theme
      const icon = L.divIcon({
        className: `custom-div-icon leaflet-marker-${colorClass}`,
        html: `<div style="background-color: ${hexColor}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${hexColor};"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker([food.latitude, food.longitude], { icon }).addTo(map);
      leafletGroup.push([food.latitude, food.longitude]);

      marker.bindPopup(`
        <div style="color: #0b1528; font-family: 'Inter', sans-serif; min-width: 180px;">
          <h4 style="margin: 0 0 6px 0; font-size: 0.9rem; font-weight: 700; color: #0d1f3c;">🍱 ${food.foodName}</h4>
          <div style="font-size: 0.78rem; line-height: 1.3; color: #475569;">
            <div><strong>Donor:</strong> ${food.donorName}</div>
            <div><strong>Quantity:</strong> ${food.quantity} servings</div>
            <div><strong>Expires:</strong> ${new Date(food.expiryTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
            <div><strong>Phone:</strong> +91 ${food.phone || "—"}</div>
            <div style="margin-top: 4px;"><strong>Status:</strong> <span style="font-weight: 700; color: ${hexColor}">${statusLabel}</span></div>
          </div>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${food.latitude},${food.longitude}" target="_blank" rel="noreferrer" style="display: block; margin-top: 8px; text-align: center; text-decoration: none; background: #10b981; color: white; padding: 4px 10px; border-radius: 5px; font-size: 0.72rem; font-weight: 700;">🧭 Navigate</a>
        </div>
      `);
    });

    // NGO Markers
    ngos.forEach((ngo) => {
      if (!ngo.latitude || !ngo.longitude) return;

      const hexColor = "#3b82f6"; // blue

      const icon = L.divIcon({
        className: "custom-div-icon leaflet-marker-ngo",
        html: `<div style="background-color: ${hexColor}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${hexColor};"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker([ngo.latitude, ngo.longitude], { icon }).addTo(map);
      leafletGroup.push([ngo.latitude, ngo.longitude]);

      marker.bindPopup(`
        <div style="color: #0b1528; font-family: 'Inter', sans-serif; min-width: 180px;">
          <h4 style="margin: 0 0 6px 0; font-size: 0.9rem; font-weight: 700; color: #1e3a8a;">🏢 ${ngo.ngoName}</h4>
          <div style="font-size: 0.78rem; line-height: 1.3; color: #475569;">
            <div><strong>Contact:</strong> ${ngo.contactPerson}</div>
            <div><strong>Phone:</strong> ${ngo.phone}</div>
            <div><strong>Capacity:</strong> ${ngo.capacity} servings</div>
            <div><strong>Address:</strong> ${ngo.address || ngo.location}</div>
          </div>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${ngo.latitude},${ngo.longitude}" target="_blank" rel="noreferrer" style="display: block; margin-top: 8px; text-align: center; text-decoration: none; background: #3b82f6; color: white; padding: 4px 10px; border-radius: 5px; font-size: 0.72rem; font-weight: 700;">🧭 Navigate</a>
        </div>
      `);
    });

    // Auto-fit boundaries
    if (leafletGroup.length > 1) {
      map.fitBounds(leafletGroup);
    }
  };

  return (
    <div className="glass-card" style={{ width: "100%", padding: "16px", marginBottom: "32px", position: "relative", zIndex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.2rem", fontWeight: "800", color: "#f0f9ff", margin: 0 }}>
            🗺️ Live Ecosystem Map
          </h3>
          <p style={{ color: "#64748b", fontSize: "0.78rem", margin: "4px 0 0 0" }}>
            Real-time view of all food donations and NGO partners
          </p>
        </div>
        
        {/* Map engine tag */}
        <div style={{
          fontSize: "0.72rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          padding: "3px 10px", borderRadius: "12px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase"
        }}>
          🛰️ {mapType === "google" ? "Google Satellite Data" : "OpenStreetMap engine"}
        </div>
      </div>

      {/* Color-coded Legend */}
      <div style={{
        display: "flex", gap: "16px", flexWrap: "wrap",
        marginBottom: "12px", padding: "10px 14px",
        background: "rgba(255,255,255,0.02)", borderRadius: "10px",
        border: "1px solid rgba(255,255,255,0.05)"
      }}>
        {[
          { color: "#10b981", label: "Available", icon: "🟢" },
          { color: "#f59e0b", label: "Claimed", icon: "🟠" },
          { color: "#ef4444", label: "Expired", icon: "🔴" },
          { color: "#3b82f6", label: "NGO Partner", icon: "🔵" },
        ].map(({ color, label, icon }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{
              width: "12px", height: "12px", borderRadius: "50%",
              background: color,
              boxShadow: `0 0 8px ${color}80`,
              flexShrink: 0
            }} />
            <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "600" }}>
              {label}
            </span>
          </div>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: "16px", alignItems: "center" }}>
          <span style={{ fontSize: "0.72rem", color: "#475569" }}>
            🍱 {foods.filter(f => f.latitude).length} food pins
          </span>
          <span style={{ fontSize: "0.72rem", color: "#475569" }}>
            🏢 {ngos.filter(n => n.latitude).length} NGO pins
          </span>
        </div>
      </div>

      {/* Map Canvas */}
      <div style={{ width: "100%", height: "440px", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)", position: "relative" }}>
        {loading && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(13,31,60,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5
          }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div className="spinner" />
              <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Rendering live coordinates...</span>
            </div>
          </div>
        )}
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Click-to-open hint */}
      <div style={{ marginTop: "8px", textAlign: "center", fontSize: "0.72rem", color: "#475569" }}>
        💡 Click any marker for details · Drag map to explore · Scroll to zoom
      </div>
    </div>
  );
}

export default DashboardMap;

