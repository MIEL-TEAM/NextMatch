import {
  getCurrentLocation,
  checkLocationPermission,
  calculateDistance,
  formatDistance,
} from "../locationUtils";

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
};

// Mock navigator.permissions
const mockPermissions = {
  query: jest.fn(),
};

// Mock global navigator
Object.defineProperty(global, "navigator", {
  value: {
    geolocation: mockGeolocation,
    permissions: mockPermissions,
  },
  writable: true,
});

describe("Location Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCurrentLocation", () => {
    it("should return coordinates when location is granted", async () => {
      const mockPosition = {
        coords: {
          latitude: 32.0853,
          longitude: 34.7818,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const result = await getCurrentLocation();

      expect(result).toEqual({
        granted: true,
        coordinates: {
          latitude: 32.0853,
          longitude: 34.7818,
        },
      });
    });

    it("should handle permission denied error", async () => {
      const mockError = {
        code: 1, // PERMISSION_DENIED
        PERMISSION_DENIED: 1,
        message: "User denied geolocation",
      };

      mockGeolocation.getCurrentPosition.mockImplementation(
        (success, error) => {
          error(mockError);
        }
      );

      const result = await getCurrentLocation();

      expect(result).toEqual({
        granted: false,
        error: "הרשאת מיקום נדחתה",
      });
    });

    it("should handle position unavailable error", async () => {
      const mockError = {
        code: 2, // POSITION_UNAVAILABLE
        POSITION_UNAVAILABLE: 2,
        message: "Position unavailable",
      };

      mockGeolocation.getCurrentPosition.mockImplementation(
        (success, error) => {
          error(mockError);
        }
      );

      const result = await getCurrentLocation();

      expect(result).toEqual({
        granted: false,
        error: "המיקום לא זמין",
      });
    });

    it("should handle timeout error", async () => {
      const mockError = {
        code: 3, // TIMEOUT
        TIMEOUT: 3,
        message: "Request timeout",
      };

      mockGeolocation.getCurrentPosition.mockImplementation(
        (success, error) => {
          error(mockError);
        }
      );

      const result = await getCurrentLocation();

      expect(result).toEqual({
        granted: false,
        error: "זמן הקבלת המיקום פג",
      });
    });

    it("should handle unknown error", async () => {
      const mockError = {
        code: 999, // Unknown error
        message: "Unknown error",
      };

      mockGeolocation.getCurrentPosition.mockImplementation(
        (success, error) => {
          error(mockError);
        }
      );

      const result = await getCurrentLocation();

      expect(result).toEqual({
        granted: false,
        error: "שגיאה בקבלת מיקום",
      });
    });

    it("should handle geolocation not supported", async () => {
      // Temporarily remove geolocation
      const originalGeolocation = global.navigator.geolocation;
      Object.defineProperty(global.navigator, "geolocation", {
        value: undefined,
        writable: true,
      });

      const result = await getCurrentLocation();

      expect(result).toEqual({
        granted: false,
        error: "הדפדפן לא תומך במיקום GPS",
      });

      // Restore geolocation
      Object.defineProperty(global.navigator, "geolocation", {
        value: originalGeolocation,
        writable: true,
      });
    });

    it("should pass custom options to getCurrentPosition", async () => {
      const customOptions = {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 60000,
      };

      mockGeolocation.getCurrentPosition.mockImplementation(
        (success, error, options) => {
          expect(options).toEqual(customOptions);
          success({ coords: { latitude: 0, longitude: 0 } });
        }
      );

      await getCurrentLocation(customOptions);

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        customOptions
      );
    });
  });

  describe("checkLocationPermission", () => {
    it("should return true when permission is granted", async () => {
      mockPermissions.query.mockResolvedValue({
        state: "granted",
      });

      const result = await checkLocationPermission();

      expect(result).toBe(true);
      expect(mockPermissions.query).toHaveBeenCalledWith({
        name: "geolocation",
      });
    });

    it("should return false when permission is denied", async () => {
      mockPermissions.query.mockResolvedValue({
        state: "denied",
      });

      const result = await checkLocationPermission();

      expect(result).toBe(false);
    });

    it("should return false when permission is prompt", async () => {
      mockPermissions.query.mockResolvedValue({
        state: "prompt",
      });

      const result = await checkLocationPermission();

      expect(result).toBe(false);
    });

    it("should return false when permissions API is not supported", async () => {
      // Temporarily remove permissions
      const originalPermissions = global.navigator.permissions;
      Object.defineProperty(global.navigator, "permissions", {
        value: undefined,
        writable: true,
      });

      const result = await checkLocationPermission();

      expect(result).toBe(false);

      // Restore permissions
      Object.defineProperty(global.navigator, "permissions", {
        value: originalPermissions,
        writable: true,
      });
    });

    it("should return false when permissions query throws error", async () => {
      mockPermissions.query.mockRejectedValue(
        new Error("Permission query failed")
      );

      const result = await checkLocationPermission();

      expect(result).toBe(false);
    });
  });

  describe("calculateDistance", () => {
    it("should calculate distance between two points correctly", () => {
      // Tel Aviv coordinates
      const lat1 = 32.0853;
      const lon1 = 34.7818;

      // Jerusalem coordinates
      const lat2 = 31.7683;
      const lon2 = 35.2137;

      const distance = calculateDistance(lat1, lon1, lat2, lon2);

      // Distance should be approximately 54km (actual calculation)
      expect(distance).toBeGreaterThan(50);
      expect(distance).toBeLessThan(60);
    });

    it("should return 0 for same coordinates", () => {
      const lat = 32.0853;
      const lon = 34.7818;

      const distance = calculateDistance(lat, lon, lat, lon);

      expect(distance).toBe(0);
    });

    it("should handle negative coordinates", () => {
      const lat1 = -33.8688;
      const lon1 = 151.2093;
      const lat2 = -33.8688;
      const lon2 = 151.21; // Much larger longitude difference

      const distance = calculateDistance(lat1, lon1, lat2, lon2);

      expect(distance).toBeGreaterThan(0);
    });

    it("should handle very small distances", () => {
      const lat1 = 32.0853;
      const lon1 = 34.7818;
      const lat2 = 32.086; // Much larger latitude difference
      const lon2 = 34.783; // Much larger longitude difference

      const distance = calculateDistance(lat1, lon1, lat2, lon2);

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(1);
    });
  });

  describe("formatDistance", () => {
    it("should format distances less than 1km in meters", () => {
      expect(formatDistance(0.5)).toBe("500מ'");
      expect(formatDistance(0.1)).toBe("100מ'");
      expect(formatDistance(0.999)).toBe("999מ'");
    });

    it("should format distances 1km and above in kilometers", () => {
      expect(formatDistance(1)).toBe('1.0 ק"מ');
      expect(formatDistance(5.5)).toBe('5.5 ק"מ');
      expect(formatDistance(10)).toBe('10.0 ק"מ');
    });

    it("should handle zero distance", () => {
      expect(formatDistance(0)).toBe("0מ'");
    });

    it("should handle very large distances", () => {
      expect(formatDistance(100)).toBe('100.0 ק"מ');
      expect(formatDistance(999.9)).toBe('999.9 ק"מ');
    });
  });
});
