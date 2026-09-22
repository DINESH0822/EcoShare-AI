import { useEffect, useRef, useState } from "react";
import axios from "axios";

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

function DashboardMap({ foods = [], ngos = [], selectedFood = null, heightClass = "h-[340px]" }) {
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(false);
  const mapRef = useRef(null);
  const mapObject = useRef(null);
  const markersRef = useRef([]);
  const routeLineRef = useRef(null);

  const defaultCenter = { lat: 19.076, lng: 72.8777 };
  const [routeInfo, setRouteInfo] = useState(null);

  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }
        await loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js");
        setLoading(false);
      } catch (err) {
        setMapError(true);
        setLoading(false);
      }
    };
    loadLeaflet();
  }, []);

  useEffect(() => {
    if (loading || mapError || !window.L || !mapRef.current) return;
    initLeafletMap();
  }, [loading, foods, ngos, mapError]);

  useEffect(() => {
    if (loading || mapError || !window.L || !mapObject.current || !selectedFood) return;
    drawRouteForFood(selectedFood);
  }, [loading, selectedFood, mapError]);

  const initLeafletMap = () => {
    try {
      const L = window.L;
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
        attributionControl: true
      }).setView(center, 12);
      mapObject.current = map;

      // Clean OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      const leafletGroup = [];

      // Food Markers
      foods.forEach((food) => {
        if (!food.latitude || !food.longitude) return;

        let hexColor = "#3B82F6";
        if (food.isEmergency || food.priority === "emergency") {
          hexColor = "#EF4444";
        } else if (food.status === "Claimed") {
          hexColor = "#F59E0B";
        }

        const icon = L.divIcon({
          className: `custom-div-icon`,
          html: `<div style="background-color: ${hexColor}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        const marker = L.marker([food.latitude, food.longitude], { icon }).addTo(map);
        leafletGroup.push([food.latitude, food.longitude]);

        marker.bindPopup(`
          <div style="color: #F8FAFC; background: #0E1624; font-family: 'Inter', sans-serif; min-width: 190px; padding: 10px; border-radius: 10px;">
            <div style="font-size: 13px; font-weight: 600; color: #3B82F6;">${food.foodName}</div>
            <div style="font-size: 12px; color: #94A3B8; margin: 4px 0 8px 0;">
              <div><strong>Donor:</strong> ${food.donorName}</div>
              <div><strong>Quantity:</strong> ${food.quantity} servings</div>
            </div>
            <button onclick="window.dispatchMapRouteClick && window.dispatchMapRouteClick('${food._id}')" style="width:100%; background:#3B82F6; color:white; border:none; padding:6px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer;">View Route</button>
          </div>
        `);

        markersRef.current.push({ id: food._id, marker });
      });

      // NGO Markers
      ngos.forEach((ngo) => {
        if (!ngo.latitude || !ngo.longitude) return;

        const icon = L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color: #22C55E; width: 14px; height: 14px; border-radius: 3px; border: 2px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        const marker = L.marker([ngo.latitude, ngo.longitude], { icon }).addTo(map);
        leafletGroup.push([ngo.latitude, ngo.longitude]);

        marker.bindPopup(`
          <div style="color: #F8FAFC; background: #0E1624; font-family: 'Inter', sans-serif; min-width: 180px; padding: 10px; border-radius: 10px;">
            <div style="font-size: 13px; font-weight: 600; color: #22C55E;">${ngo.ngoName}</div>
            <div style="font-size: 12px; color: #94A3B8; margin-top: 4px;">
              <div><strong>Contact:</strong> ${ngo.contactPerson}</div>
              <div><strong>Capacity:</strong> ${ngo.capacity} servings</div>
            </div>
          </div>
        `);
      });

      window.dispatchMapRouteClick = (foodId) => {
        const match = foods.find(f => f._id === foodId);
        if (match) drawRouteForFood(match);
      };

      if (leafletGroup.length > 1) {
        map.fitBounds(leafletGroup, { padding: [40, 40] });
      }
    } catch (err) {
      setMapError(true);
    }
  };

  const drawRouteForFood = async (food) => {
    if (!mapObject.current || !window.L) return;
    const L = window.L;

    if (routeLineRef.current) {
      mapObject.current.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    let targetNgo = null;
    if (food.claimedByNgoId) {
      targetNgo = ngos.find(n => n._id === food.claimedByNgoId);
    } else if (food.recommendation && food.recommendation.recommendedNgoId) {
      targetNgo = ngos.find(n => n._id === food.recommendation.recommendedNgoId);
    }

    if (!targetNgo || !targetNgo.latitude || !targetNgo.longitude) {
      setRouteInfo(null);
      mapObject.current.setView([food.latitude, food.longitude], 14);
      return;
    }

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${food.longitude},${food.latitude};${targetNgo.longitude},${targetNgo.latitude}?overview=full&geometries=geojson`;
      const res = await axios.get(url);

      if (res.data.routes && res.data.routes.length > 0) {
        const route = res.data.routes[0];
        const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);

        const polyline = L.polyline(coordinates, {
          color: "#3B82F6",
          weight: 4,
          opacity: 0.9,
        }).addTo(mapObject.current);

        routeLineRef.current = polyline;

        const distanceKm = (route.distance / 1000).toFixed(1);
        const durationMins = Math.round(route.duration / 60);

        setRouteInfo({
          foodName: food.foodName,
          ngoName: targetNgo.ngoName,
          distance: `${distanceKm} km`,
          duration: `${durationMins} mins`
        });

        const bounds = L.latLngBounds([
          [food.latitude, food.longitude],
          [targetNgo.latitude, targetNgo.longitude]
        ]);
        mapObject.current.fitBounds(bounds, { padding: [40, 40] });
      }
    } catch (error) {
      const polyline = L.polyline([
        [food.latitude, food.longitude],
        [targetNgo.latitude, targetNgo.longitude]
      ], {
        color: "#EF4444",
        weight: 3,
        dashArray: "5, 5"
      }).addTo(mapObject.current);

      routeLineRef.current = polyline;
      setRouteInfo({
        foodName: food.foodName,
        ngoName: targetNgo.ngoName,
        distance: "Direct Line",
        duration: "Calculating..."
      });
    }
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-5 shadow-[0_10px_18px_rgba(17,52,40,0.02)] flex flex-col justify-between h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-[1.3rem] font-bold text-[var(--text)]">Live rescue network</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Active donations and organization locations</p>
        </div>

        <div className="flex items-center gap-4 flex-wrap text-xs text-[var(--text-secondary)] font-medium">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" /> Available</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[var(--danger)]" /> Urgent</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[var(--warning)]" /> Claimed</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[var(--primary)]" /> Organization</div>
        </div>
      </div>

      <div className={`w-full ${heightClass} rounded-[18px] overflow-hidden border border-[var(--border)] relative bg-[var(--surface-soft)]`}>
        {loading && (
          <div className="absolute inset-0 bg-[rgba(255,255,255,0.8)] flex items-center justify-center z-20">
            <div className="text-sm text-[var(--text-secondary)] font-medium">Loading map service...</div>
          </div>
        )}

        {mapError && (
          <div className="absolute inset-0 bg-[var(--surface-soft)] flex flex-col items-center justify-center p-6 text-center z-30">
            <h4 className="text-sm font-semibold text-[var(--text)]">Map Service Unavailable</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm">Configure a valid map provider to enable live mapping.</p>
          </div>
        )}

        <div ref={mapRef} className="w-full h-full" />

        {routeInfo && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 bg-[var(--surface)] border border-[var(--border)] p-3.5 rounded-xl shadow-[var(--shadow)] z-[1000] max-w-xs text-xs">
            <div className="font-semibold text-[var(--primary-dark)] mb-1">Route Overview</div>
            <div className="text-[var(--text)]"><strong>Item:</strong> {routeInfo.foodName}</div>
            <div className="text-[var(--text)]"><strong>NGO:</strong> {routeInfo.ngoName}</div>
            <div className="text-[var(--text-secondary)] mt-1"><strong>ETA:</strong> {routeInfo.duration} ({routeInfo.distance})</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardMap;
