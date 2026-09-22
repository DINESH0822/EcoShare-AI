/**
 * Geocoding Provider Abstraction
 *
 * Environment:
 *   GEOCODING_PROVIDER=development|google|nominatim
 *   GOOGLE_MAPS_API_KEY=...
 *
 * Never use 0,0 as fallback. Never fabricate coordinates.
 * If geocoding fails, return null and let the caller handle it.
 */

const GEOCODING_PROVIDER = process.env.GEOCODING_PROVIDER || "development";

/**
 * Development/demo geocoder — returns null for all lookups.
 * The frontend should use map click / GPS for coordinate entry.
 * This provider is safe to run without any API key.
 */
class DevelopmentGeocoder {
  async geocode(address) {
    // In development, coordinates must come from the user via map interaction.
    // We do NOT attempt to fabricate or estimate coordinates from text.
    return null;
  }

  async reverseGeocode(lat, lng) {
    if (!lat || !lng || lat === 0 || lng === 0) return null;
    // Return minimal information — city/state would require an API
    return {
      latitude: lat,
      longitude: lng,
      formattedAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)} (coordinates)`,
      city: "",
      state: "",
      country: "India",
      pincode: "",
      provider: "development",
      note: "Address details unavailable in development mode"
    };
  }

  getProviderName() {
    return "development";
  }
}

/**
 * Google Maps Geocoding Provider
 * Requires GOOGLE_MAPS_API_KEY
 */
class GoogleGeocoder {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!this.apiKey || this.apiKey === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
      throw new Error("Google Geocoder requires a valid GOOGLE_MAPS_API_KEY");
    }
  }

  async geocode(address) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}&region=in`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK" || !data.results?.length) {
        console.warn(`[GoogleGeocoder] No results for address: ${address} (status: ${data.status})`);
        return null;
      }

      const result = data.results[0];
      const location = result.geometry.location;

      const components = result.address_components || [];
      const getComponent = (type) =>
        components.find((c) => c.types.includes(type))?.long_name || "";

      return {
        latitude: location.lat,
        longitude: location.lng,
        formattedAddress: result.formatted_address,
        city: getComponent("locality") || getComponent("administrative_area_level_2"),
        state: getComponent("administrative_area_level_1"),
        country: getComponent("country"),
        pincode: getComponent("postal_code"),
        provider: "google"
      };
    } catch (error) {
      console.error("[GoogleGeocoder] Geocoding error:", error.message);
      return null;
    }
  }

  async reverseGeocode(lat, lng) {
    if (!lat || !lng || lat === 0 || lng === 0) return null;
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}&region=in`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK" || !data.results?.length) return null;

      const result = data.results[0];
      const components = result.address_components || [];
      const getComponent = (type) =>
        components.find((c) => c.types.includes(type))?.long_name || "";

      return {
        latitude: lat,
        longitude: lng,
        formattedAddress: result.formatted_address,
        city: getComponent("locality") || getComponent("administrative_area_level_2"),
        state: getComponent("administrative_area_level_1"),
        country: getComponent("country"),
        pincode: getComponent("postal_code"),
        provider: "google"
      };
    } catch (error) {
      console.error("[GoogleGeocoder] Reverse geocoding error:", error.message);
      return null;
    }
  }

  getProviderName() {
    return "google";
  }
}

/**
 * Factory: returns the configured geocoding provider
 */
function createGeocodingProvider() {
  const provider = GEOCODING_PROVIDER;

  if (provider === "google") {
    try {
      return new GoogleGeocoder();
    } catch (err) {
      console.warn(`[Geocoding] Cannot use Google provider: ${err.message}. Falling back to development.`);
      return new DevelopmentGeocoder();
    }
  }

  // Default: development (safe, no API key needed)
  return new DevelopmentGeocoder();
}

const geocodingProvider = createGeocodingProvider();

module.exports = {
  geocodingProvider,
  createGeocodingProvider,
  DevelopmentGeocoder,
  GoogleGeocoder
};
