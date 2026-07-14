export function getDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return Infinity;
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return Infinity;
  
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export function getSortedNGOs(donorLat, donorLng, ngos) {
  if (!donorLat || !donorLng || !ngos || ngos.length === 0) return [];
  return ngos
    .map(ngo => {
      const dist = getDistance(donorLat, donorLng, ngo.latitude, ngo.longitude);
      return { ...ngo, distance: parseFloat(dist.toFixed(1)) };
    })
    .sort((a, b) => a.distance - b.distance);
}
