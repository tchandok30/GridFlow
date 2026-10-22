
const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const isValidLocation = (point) => {
  const latitude = Number(point?.latitude);
  const longitude = Number(point?.longitude);

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

export const haversineDistance = (a, b) => {
  if (!isValidLocation(a) || !isValidLocation(b)) {
    throw new Error("Invalid latitude or longitude");
  }

  const lat1 = Number(a.latitude);
  const lon1 = Number(a.longitude);
  const lat2 = Number(b.latitude);
  const lon2 = Number(b.longitude);

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const safeValue = Math.min(1, Math.max(0, value));

  return (
    2 *
    EARTH_RADIUS_KM *
    Math.asin(Math.sqrt(safeValue))
  );
};

const getRouteDistance = (stops, depot) => {
  if (stops.length === 0) return 0;

  let distance = 0;
  let current = depot;

  for (const stop of stops) {
    distance += haversineDistance(current, stop);
    current = stop;
  }

  // Return to depot after the final delivery.
  distance += haversineDistance(current, depot);

  return distance;
};

export const optimizeRoute = (orders, depot) => {
  if (!Array.isArray(orders) || !isValidLocation(depot)) {
    throw new Error("Invalid orders or depot coordinates");
  }

  for (const order of orders) {
    if (!isValidLocation(order)) {
      throw new Error(
        `Invalid coordinates for order ${order.order_number ?? order.order_id ?? ""}`
      );
    }
  }

  if (orders.length === 0) {
    return {
      stops: [],
      totalDistanceKm: 0,
      returnToDepotKm: 0,
    };
  }

  // Step 1: Nearest Neighbor initial route.
  const remaining = [...orders];
  const stops = [];
  let current = depot;

  while (remaining.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const distance = haversineDistance(
        current,
        remaining[i]
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    const [next] = remaining.splice(nearestIndex, 1);

    stops.push(next);
    current = next;
  }

  // Step 2: Improve the route using 2-opt.
  let improved = true;

  while (improved) {
    improved = false;

    for (let i = 0; i < stops.length - 1; i++) {
      for (let k = i + 1; k < stops.length; k++) {
        const candidate = [
          ...stops.slice(0, i),
          ...stops.slice(i, k + 1).reverse(),
          ...stops.slice(k + 1),
        ];

        const currentDistance = getRouteDistance(
          stops,
          depot
        );

        const candidateDistance = getRouteDistance(
          candidate,
          depot
        );

        if (candidateDistance < currentDistance - 1e-9) {
          stops.splice(0, stops.length, ...candidate);
          improved = true;
        }
      }
    }
  }

  // Step 3: Calculate distances between consecutive stops.
  let previous = depot;

  const routeStops = stops.map((stop) => {
    const distance = haversineDistance(previous, stop);
    previous = stop;

    return {
      order_id: stop.order_id,
      order_number: stop.order_number,
      delivery_address: stop.delivery_address,
      distance_from_previous_km: Number(
        distance.toFixed(2)
      ),
    };
  });

  const returnToDepotKm = haversineDistance(previous, depot);

  return {
    stops: routeStops,
    totalDistanceKm: Number(
      getRouteDistance(stops, depot).toFixed(2)
    ),
    returnToDepotKm: Number(returnToDepotKm.toFixed(2)),
  };
};
