import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useSearchParams, useRouter } from "next/navigation";
import MembersClient from "../MembersClient";
import {
  checkLocationPermission,
  getCurrentLocation,
} from "@/lib/locationUtils";
import { fetchCurrentUserLikeIds } from "@/app/actions/likeActions";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock location utilities
jest.mock("@/lib/locationUtils", () => ({
  checkLocationPermission: jest.fn(),
  getCurrentLocation: jest.fn(),
}));

// Mock actions
jest.mock("@/app/actions/likeActions", () => ({
  fetchCurrentUserLikeIds: jest.fn(),
}));

// Mock hooks
jest.mock("@/hooks/useMembersQuery", () => ({
  __esModule: true,
  default: () => ({
    isLoading: false,
    isError: false,
    isFetchedAfterMount: true,
    data: {
      data: [],
      totalCount: 0,
    },
  }),
}));

// Mock components
jest.mock("@/components/memberStyles/MembersLayout", () => {
  return function MockMembersLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div data-testid="members-layout">{children}</div>;
  };
});

jest.mock("@/components/LocationPermissionModal", () => {
  return function MockLocationModal({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) {
    if (!isOpen) return null;
    return (
      <div data-testid="location-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    );
  };
});

// Mock the mocked functions
const mockCheckLocationPermission =
  checkLocationPermission as jest.MockedFunction<
    typeof checkLocationPermission
  >;
const mockGetCurrentLocation = getCurrentLocation as jest.MockedFunction<
  typeof getCurrentLocation
>;
const mockFetchCurrentUserLikeIds =
  fetchCurrentUserLikeIds as jest.MockedFunction<
    typeof fetchCurrentUserLikeIds
  >;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSearchParams = useSearchParams as jest.MockedFunction<
  typeof useSearchParams
>;

describe("MembersClient", () => {
  const mockRouter = {
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    push: jest.fn(),
    prefetch: jest.fn(),
  };

  const createMockSearchParams = (params: Record<string, string> = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.set(key, value);
    });
    return searchParams as unknown as ReturnType<typeof useSearchParams>;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
    mockUseSearchParams.mockReturnValue(createMockSearchParams());
    mockFetchCurrentUserLikeIds.mockResolvedValue([]);
  });

  it("should show location modal when no location params and no permission", async () => {
    mockCheckLocationPermission.mockResolvedValue(false);

    render(<MembersClient />);

    await waitFor(() => {
      expect(screen.getByTestId("location-modal")).toBeInTheDocument();
    });
  });

  it("should show location modal when permission check fails", async () => {
    mockCheckLocationPermission.mockRejectedValue(
      new Error("Permission check failed")
    );

    render(<MembersClient />);

    await waitFor(() => {
      expect(screen.getByTestId("location-modal")).toBeInTheDocument();
    });
  });

  it("should not show location modal when location params exist", async () => {
    mockUseSearchParams.mockReturnValue(
      createMockSearchParams({
        userLat: "32.0853",
        userLon: "34.7818",
      })
    );

    render(<MembersClient />);

    await waitFor(() => {
      expect(screen.queryByTestId("location-modal")).not.toBeInTheDocument();
    });
  });

  it("should auto-get location when permission exists", async () => {
    mockCheckLocationPermission.mockResolvedValue(true);
    mockGetCurrentLocation.mockResolvedValue({
      granted: true,
      coordinates: { latitude: 32.0853, longitude: 34.7818 },
    });

    render(<MembersClient />);

    await waitFor(() => {
      expect(mockGetCurrentLocation).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith(
        expect.stringContaining(
          "userLat=32.0853&userLon=34.7818&sortByDistance=true"
        )
      );
    });

    expect(screen.queryByTestId("location-modal")).not.toBeInTheDocument();
  });

  it("should show location modal when auto-location fails", async () => {
    mockCheckLocationPermission.mockResolvedValue(true);
    mockGetCurrentLocation.mockResolvedValue({
      granted: false,
      error: "הרשאת מיקום נדחתה",
    });

    render(<MembersClient />);

    await waitFor(() => {
      expect(mockGetCurrentLocation).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByTestId("location-modal")).toBeInTheDocument();
    });
  });

  it("should show location modal when auto-location throws error", async () => {
    mockCheckLocationPermission.mockResolvedValue(true);
    mockGetCurrentLocation.mockRejectedValue(new Error("Location error"));

    render(<MembersClient />);

    await waitFor(() => {
      expect(mockGetCurrentLocation).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByTestId("location-modal")).toBeInTheDocument();
    });
  });

  it("should fetch user like IDs on mount", async () => {
    render(<MembersClient />);

    await waitFor(() => {
      expect(mockFetchCurrentUserLikeIds).toHaveBeenCalledTimes(1);
    });
  });

  it("should render members layout when data is available", async () => {
    render(<MembersClient />);

    await waitFor(() => {
      expect(screen.getByTestId("members-layout")).toBeInTheDocument();
    });
  });

  it("should handle location modal close", async () => {
    mockCheckLocationPermission.mockResolvedValue(false);

    render(<MembersClient />);

    await waitFor(() => {
      expect(screen.getByTestId("location-modal")).toBeInTheDocument();
    });

    const closeButton = screen.getByText("Close Modal");
    closeButton.click();

    await waitFor(() => {
      expect(screen.queryByTestId("location-modal")).not.toBeInTheDocument();
    });
  });

  it("should not show location modal after it has been processed", async () => {
    mockCheckLocationPermission.mockResolvedValue(false);

    const { rerender } = render(<MembersClient />);

    await waitFor(() => {
      expect(screen.getByTestId("location-modal")).toBeInTheDocument();
    });

    // Simulate location being processed
    mockUseSearchParams.mockReturnValue(
      createMockSearchParams({
        userLat: "32.0853",
        userLon: "34.7818",
      })
    );

    rerender(<MembersClient />);

    await waitFor(() => {
      expect(screen.queryByTestId("location-modal")).not.toBeInTheDocument();
    });
  });

  it("should handle multiple location permission checks correctly", async () => {
    // First render - no permission
    mockCheckLocationPermission.mockResolvedValue(false);

    const { rerender } = render(<MembersClient />);

    await waitFor(() => {
      expect(screen.getByTestId("location-modal")).toBeInTheDocument();
    });

    // Second render - with permission
    mockCheckLocationPermission.mockResolvedValue(true);
    mockGetCurrentLocation.mockResolvedValue({
      granted: true,
      coordinates: { latitude: 32.0853, longitude: 34.7818 },
    });

    rerender(<MembersClient />);

    await waitFor(() => {
      expect(mockGetCurrentLocation).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith(
        expect.stringContaining(
          "userLat=32.0853&userLon=34.7818&sortByDistance=true"
        )
      );
    });
  });
});
