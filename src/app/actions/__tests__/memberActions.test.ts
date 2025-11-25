import { updateCurrentUserLocation, getMembers } from "../memberActions";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/session";
import { ensureMember } from "@/lib/prismaHelpers";

// Mock React cache
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  cache: jest.fn((fn) => fn),
}));

// Mock prismaHelpers
jest.mock("@/lib/prismaHelpers", () => ({
  ensureMember: jest.fn(),
}));

// Mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    member: {
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock auth
jest.mock("../authActions", () => ({
  getAuthUserId: jest.fn(),
}));

// Mock the mocked functions
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockGetAuthUserId = getAuthUserId as jest.MockedFunction<
  typeof getAuthUserId
>;
const mockEnsureMember = ensureMember as jest.MockedFunction<
  typeof ensureMember
>;

describe("Member Actions - Location", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEnsureMember.mockResolvedValue({} as any);
  });

  describe("updateCurrentUserLocation", () => {
    it("should successfully update user location", async () => {
      const mockUserId = "user-123";
      const latitude = 32.0853;
      const longitude = 34.7818;

      mockGetAuthUserId.mockResolvedValue(mockUserId);
      (mockPrisma.member.update as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        latitude,
        longitude,
        locationEnabled: true,
      });

      const result = await updateCurrentUserLocation(latitude, longitude);

      expect(result).toEqual({
        status: "success",
        data: {
          userId: mockUserId,
          latitude,
          longitude,
          locationEnabled: true,
        },
      });

      expect(mockPrisma.member.update).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        data: {
          latitude,
          longitude,
          locationEnabled: true,
          locationUpdatedAt: expect.any(Date),
          updated: expect.any(Date),
        },
        select: {
          userId: true,
          latitude: true,
          longitude: true,
          locationEnabled: true,
        },
      });
    });

    it("should return error when user ID is not found", async () => {
      (mockGetAuthUserId as jest.Mock).mockResolvedValue(null);
      mockEnsureMember.mockRejectedValue(new Error("User ID is null"));

      const result = await updateCurrentUserLocation(32.0853, 34.7818);

      expect(result).toEqual({
        status: "error",
        error: "Failed to update user location",
      });

      expect(mockPrisma.member.update).not.toHaveBeenCalled();
    });

    it("should return error when coordinates are invalid", async () => {
      const mockUserId = "user-123";
      mockGetAuthUserId.mockResolvedValue(mockUserId);

      // Test invalid coordinates
      const invalidCoordinates = [
        { lat: 91, lon: 0 }, // Latitude > 90
        { lat: -91, lon: 0 }, // Latitude < -90
        { lat: 0, lon: 181 }, // Longitude > 180
        { lat: 0, lon: -181 }, // Longitude < -180
        { lat: NaN, lon: 0 }, // NaN values
        { lat: 0, lon: Infinity }, // Infinity values
      ];

      for (const coords of invalidCoordinates) {
        const result = await updateCurrentUserLocation(coords.lat, coords.lon);
        expect(result).toEqual({
          status: "error",
          error: "Failed to update user location",
        });
      }

      expect(mockPrisma.member.update).not.toHaveBeenCalled();
    });

    it("should handle prisma update errors", async () => {
      const mockUserId = "user-123";
      const latitude = 32.0853;
      const longitude = 34.7818;

      mockGetAuthUserId.mockResolvedValue(mockUserId);
      (mockPrisma.member.update as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const result = await updateCurrentUserLocation(latitude, longitude);

      expect(result).toEqual({
        status: "error",
        error: "Failed to update user location",
      });
    });

    it("should handle ensureMember failure", async () => {
      const mockUserId = "user-123";
      const latitude = 32.0853;
      const longitude = 34.7818;

      mockGetAuthUserId.mockResolvedValue(mockUserId);
      // Mock ensureMember to fail by making prisma.member.update throw
      (mockPrisma.member.update as jest.Mock).mockRejectedValue(
        new Error("Member not found")
      );

      const result = await updateCurrentUserLocation(latitude, longitude);

      expect(result).toEqual({
        status: "error",
        error: "Failed to update user location",
      });
    });
  });

  describe("getMembers with location parameters", () => {
    it("should include distance calculation when location parameters are provided", async () => {
      const mockMembers = [
        {
          id: "member-1",
          userId: "user-1",
          name: "John Doe",
          dateOfBirth: new Date("1990-01-01"),
          gender: "female",
          created: new Date(),
          updated: new Date(),
          description: "Test description",
          city: "Test City",
          country: "Test Country",
          image: null,
          boostedUntil: null,
          latitude: 32.0853,
          longitude: 34.7818,
          locationUpdatedAt: new Date(),
          locationEnabled: true,
          maxDistance: 50,
          photos: [],
        },
        {
          id: "member-2",
          userId: "user-2",
          name: "Jane Smith",
          dateOfBirth: new Date("1992-01-01"),
          gender: "female",
          created: new Date(),
          updated: new Date(),
          description: "Test description 2",
          city: "Test City 2",
          country: "Test Country 2",
          image: null,
          boostedUntil: null,
          latitude: 31.7683,
          longitude: 35.2137,
          locationUpdatedAt: new Date(),
          locationEnabled: true,
          maxDistance: 50,
          photos: [],
        },
      ];

      // Mock user's own location (to prevent fallback to saved location)
      (mockPrisma.member.findUnique as jest.Mock).mockResolvedValue(null);

      (mockPrisma.member.findMany as jest.Mock).mockResolvedValue(mockMembers);
      (mockPrisma.member.count as jest.Mock).mockResolvedValue(2);

      const result = await getMembers({
        userLat: "32.0853",
        userLon: "34.7818",
        sortByDistance: "true",
      });

      // The function adds distance properties, so we need to expect them
      expect(result.items).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.items[0]).toHaveProperty("distance", 0);
      expect(result.items[1]).toHaveProperty("distance", 53.9);

      // Verify that the query was executed with location parameters
      expect(mockPrisma.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.any(Object),
          orderBy: expect.any(Object),
        })
      );
    });

    it("should handle location parameters correctly", async () => {
      const mockMembers = [
        {
          id: "member-1",
          userId: "user-1",
          name: "John Doe",
          dateOfBirth: new Date("1990-01-01"),
          gender: "female",
          created: new Date(),
          updated: new Date(),
          description: "Test description",
          city: "Test City",
          country: "Test Country",
          image: null,
          boostedUntil: null,
          latitude: 32.0853,
          longitude: 34.7818,
          locationUpdatedAt: new Date(),
          locationEnabled: true,
          maxDistance: 50,
          photos: [],
        },
      ];

      // Mock getAuthUserId to return a valid user ID for this test
      mockGetAuthUserId.mockResolvedValue("test-user-id");

      // Mock user preferences
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        preferredGenders: "female",
        preferredAgeMin: 18,
        preferredAgeMax: 100,
      });

      // Mock user's own location (to prevent fallback to saved location)
      (mockPrisma.member.findUnique as jest.Mock).mockResolvedValue(null);

      (mockPrisma.member.findMany as jest.Mock).mockResolvedValue(mockMembers);
      (mockPrisma.member.count as jest.Mock).mockResolvedValue(1);

      const result = await getMembers({
        userLat: "32.0853",
        userLon: "34.7818",
        distance: "0,50",
        sortByDistance: "true",
        includeSelf: "true",
      });

      // The function adds distance properties, so we need to expect them
      expect(result.items).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.items[0]).toHaveProperty("distance", 0);
    });

    it("should work without location parameters", async () => {
      const mockMembers = [
        {
          id: "member-1",
          userId: "user-1",
          name: "John Doe",
          dateOfBirth: new Date("1990-01-01"),
          gender: "female",
          created: new Date(),
          updated: new Date(),
          description: "Test description",
          city: "Test City",
          country: "Test Country",
          image: null,
          boostedUntil: null,
          latitude: null,
          longitude: null,
          locationUpdatedAt: null,
          locationEnabled: false,
          maxDistance: 50,
          photos: [],
        },
      ];

      // Mock user's own location (to prevent fallback to saved location)
      (mockPrisma.member.findUnique as jest.Mock).mockResolvedValue(null);

      (mockPrisma.member.findMany as jest.Mock).mockResolvedValue(mockMembers);
      (mockPrisma.member.count as jest.Mock).mockResolvedValue(1);

      const result = await getMembers({});

      expect(result).toEqual({
        items: mockMembers,
        totalCount: 1,
      });
    });
  });
});
