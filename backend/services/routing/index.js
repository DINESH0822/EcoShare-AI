/**
 * Routing Provider Abstraction
 *
 * Environment:
 *   ROUTING_PROVIDER=development|google
 *   GOOGLE_ROUTES_API_KEY=...
 *
 * IMPORTANT:
 * - Never hardcode distances or durations
 * - Never fabricate traffic data
 * - Never claim live traffic if using static estimates
 * - If provider unavailable, return null and label as unavailable
 */

const ROUTING_PROVIDER = process.env.ROUTING_PROVIDER || "development";

// Haversine formula — straight-line distance (km)
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

/**
 * Development routing provider
 * Uses Haversine distance * road factor estimate.
 * Clearly labels all values as ESTIMATED.
 * No live traffic. No API key required.
 */
class DevelopmentRoutingProvider {
  // Road distance factor (typical road distance ≈ 1.35x straight-line for Indian cities)
  ROAD_FACTOR = 1.35;

  // Speed estimate: 25 km/h average for urban areas
  AVG_SPEED_KMPH = 25;

  async getRoute(originLat, originLng, destLat, destLng) {
    if (!originLat || !originLng || !destLat || !destLng) return null;
    if (originLat === 0 || originLng === 0 || destLat === 0 || destLng === 0) return null;

    const straightLineKm = haversineDistance(originLat, originLng, destLat, destLng);
    const estimatedRoadKm = parseFloat((straightLineKm * this.ROAD_FACTOR).toFixed(2));
    const estimatedMinutes = Math.round((estimatedRoadKm / this.AVG_SPEED_KMPH) * 60);

    return {
      distance: estimatedRoadKm,
      distanceText: `~${estimatedRoadKm} km`,
      duration: estimatedMinutes,
      durationText: `~${estimatedMinutes} min`,
      trafficDuration: null,
      trafficDurationText: null,
      polyline: null, // No polyline in development mode
      provider: "development",
      isEstimated: true,
      note: "Estimated distance and duration. Enable routing provider for accurate data.",
      straightLineKm
    };
  }

  async getRouteMatrix(origins, destinations) {
    // origins/destinations are arrays of {lat, lng}
    const results = [];
    for (const origin of origins) {
      for (const dest of destinations) {
        const route = await this.getRoute(origin.lat, origin.lng, dest.lat, dest.lng);
        results.push({
          origin,
          destination: dest,
          route
        });
      }
    }
    return results;
  }

  getProviderName() {
    return "development";
  }
}

/**
 * Google Routes API Provider
 * Supports: distance, duration, traffic-aware duration, polyline
 * Requires GOOGLE_ROUTES_API_KEY
 */
class GoogleRoutingProvider {
  constructor() {
    this.apiKey = process.env.GOOGLE_ROUTES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
    if (!this.apiKey || this.apiKey === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
      throw new Error("Google Routing requires a valid GOOGLE_ROUTES_API_KEY");
    }
    this.baseUrl = "https://routes.googleapis.com/directions/v2:computeRoutes";
  }

  async getRoute(originLat, originLng, destLat, destLng) {
    if (!originLat || !originLng || !destLat || !destLng) return null;

    try {
      const body = {
        origin: {
          location: { latLng: { latitude: originLat, longitude: originLng } }
        },
        destination: {
          location: { latLng: { latitude: destLat, longitude: destLng } }
        },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE",
        computeAlternativeRoutes: false,
        routeModifiers: { avoidHighways: false, avoidTolls: false },
        languageCode: "en-IN",
        units: "METRIC"
      };

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": this.apiKey,
          "X-Goog-FieldMask":
            "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.travelAdvisory"
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!data.routes?.length) {
        console.warn("[GoogleRouting] No routes found");
        return null;
      }

      const route = data.routes[0];
      const distanceKm = parseFloat((route.distanceMeters / 1000).toFixed(2));
      const durationSecs = parseInt(route.duration?.replace("s", "") || "0");
      const durationMins = Math.round(durationSecs / 60);

      const trafficSecs = route.travelAdvisory?.transitFare
        ? null // not applicable
        : null;

      return {
        distance: distanceKm,
        distanceText: `${distanceKm} km`,
        duration: durationMins,
        durationText: `${durationMins} min`,
        trafficDuration: trafficSecs ? Math.round(trafficSecs / 60) : null,
        trafficDurationText: trafficSecs ? `${Math.round(trafficSecs / 60)} min (with traffic)` : null,
        polyline: route.polyline?.encodedPolyline || null,
        provider: "google",
        isEstimated: false,
        note: null
      };
    } catch (error) {
      console.error("[GoogleRouting] Error:", error.message);
      return null;
    }
  }

  async getRouteMatrix(origins, destinations) {
    // For matrix routing, fall back to individual calls
    const results = [];
    for (const origin of origins) {
      for (const dest of destinations) {
        const route = await this.getRoute(origin.lat, origin.lng, dest.lat, dest.lng);
        results.push({ origin, destination: dest, route });
      }
    }
    return results;
  }

  getProviderName() {
    return "google";
  }
}

/**
 * Factory: returns the configured routing provider
 */
function createRoutingProvider() {
  const provider = ROUTING_PROVIDER;

  if (provider === "google") {
    try {
      return new GoogleRoutingProvider();
    } catch (err) {
      console.warn(`[Routing] Cannot use Google provider: ${err.message}. Falling back to development.`);
      return new DevelopmentRoutingProvider();
    }
  }

  return new DevelopmentRoutingProvider();
}

const routingProvider = createRoutingProvider();

module.exports = {
  routingProvider,
  createRoutingProvider,
  haversineDistance,
  DevelopmentRoutingProvider,
  GoogleRoutingProvider
};
