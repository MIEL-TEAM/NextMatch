export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationPermissionResult {
  granted: boolean;
  coordinates?: LocationCoordinates;
  error?: string;
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function getCurrentLocation(
  options: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000,
  }
): Promise<LocationPermissionResult> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !navigator?.geolocation) {
      resolve({
        granted: false,
        error: "הדפדפן לא תומך במיקום GPS",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          granted: true,
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      },
      (error) => {
        let errorMessage = "שגיאה בקבלת מיקום";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "הרשאת מיקום נדחתה";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "המיקום לא זמין";
            break;
          case error.TIMEOUT:
            errorMessage = "זמן הקבלת המיקום פג";
            break;
        }

        resolve({
          granted: false,
          error: errorMessage,
        });
      },
      options
    );
  });
}

export async function checkLocationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !navigator?.permissions) {
    return false;
  }

  try {
    const permission = await navigator.permissions.query({
      name: "geolocation",
    });
    return permission.state === "granted";
  } catch {
    return false;
  }
}

export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}מ'`;
  }
  return `${distance.toFixed(1)} ק"מ`;
}

export function isValidCoordinates(lat: number, lon: number): boolean {
  return (
    typeof lat === "number" &&
    typeof lon === "number" &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180 &&
    !isNaN(lat) &&
    !isNaN(lon)
  );
}
