import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import LocationPermissionModal from "../LocationPermissionModal";
import { getCurrentLocation } from "@/lib/locationUtils";
import { updateCurrentUserLocation } from "@/app/actions/memberActions";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock location utilities
jest.mock("@/lib/locationUtils", () => ({
  getCurrentLocation: jest.fn(),
}));

// Mock member actions
jest.mock("@/app/actions/memberActions", () => ({
  updateCurrentUserLocation: jest.fn(),
}));

// Mock the mocked functions
const mockGetCurrentLocation = getCurrentLocation as jest.MockedFunction<
  typeof getCurrentLocation
>;
const mockUpdateCurrentUserLocation =
  updateCurrentUserLocation as jest.MockedFunction<
    typeof updateCurrentUserLocation
  >;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSearchParams = useSearchParams as jest.MockedFunction<
  typeof useSearchParams
>;

describe("LocationPermissionModal", () => {
  const mockRouter = {
    replace: jest.fn(),
  };

  const mockSearchParams = new URLSearchParams();

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onLocationGranted: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter as any);
    mockUseSearchParams.mockReturnValue(mockSearchParams as any);
  });

  it("should render when open", () => {
    render(<LocationPermissionModal {...defaultProps} />);

    expect(screen.getByText("אפשר גישה למיקום")).toBeInTheDocument();
    expect(screen.getByText("אפשר גישה למיקום")).toBeInTheDocument();
    expect(screen.getByText("דלג")).toBeInTheDocument();
  });

  it("should not render when closed", () => {
    render(<LocationPermissionModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText("אפשר גישה למיקום")).not.toBeInTheDocument();
  });

  it("should call onClose when skip button is clicked", () => {
    render(<LocationPermissionModal {...defaultProps} />);

    const skipButton = screen.getByText("דלג");
    fireEvent.click(skipButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("should handle successful location access", async () => {
    const mockCoordinates = {
      latitude: 32.0853,
      longitude: 34.7818,
    };

    mockGetCurrentLocation.mockResolvedValue({
      granted: true,
      coordinates: mockCoordinates,
    });

    mockUpdateCurrentUserLocation.mockResolvedValue({
      status: "success",
      data: {
        userId: "123",
        latitude: 32.0853,
        longitude: 34.7818,
        locationEnabled: true,
      },
    });

    render(<LocationPermissionModal {...defaultProps} />);

    const enableButton = screen.getByText("אפשר גישה למיקום");
    fireEvent.click(enableButton);

    await waitFor(() => {
      expect(mockGetCurrentLocation).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mockUpdateCurrentUserLocation).toHaveBeenCalledWith(
        mockCoordinates.latitude,
        mockCoordinates.longitude
      );
    });

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith(
        expect.stringContaining(
          "userLat=32.0853&userLon=34.7818&sortByDistance=true&includeSelf=true"
        )
      );
    });

    await waitFor(() => {
      expect(defaultProps.onLocationGranted).toHaveBeenCalledWith(
        mockCoordinates
      );
    });

    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  it("should handle location permission denied", async () => {
    mockGetCurrentLocation.mockResolvedValue({
      granted: false,
      error: "הרשאת מיקום נדחתה",
    });

    render(<LocationPermissionModal {...defaultProps} />);

    const enableButton = screen.getByText("אפשר גישה למיקום");
    fireEvent.click(enableButton);

    await waitFor(() => {
      expect(screen.getByText("הרשאת מיקום נדחתה")).toBeInTheDocument();
    });

    expect(mockUpdateCurrentUserLocation).not.toHaveBeenCalled();
    expect(mockRouter.replace).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it("should handle location unavailable error", async () => {
    mockGetCurrentLocation.mockResolvedValue({
      granted: false,
      error: "המיקום לא זמין",
    });

    render(<LocationPermissionModal {...defaultProps} />);

    const enableButton = screen.getByText("אפשר גישה למיקום");
    fireEvent.click(enableButton);

    await waitFor(() => {
      expect(screen.getByText("המיקום לא זמין")).toBeInTheDocument();
    });
  });

  it("should handle timeout error", async () => {
    mockGetCurrentLocation.mockResolvedValue({
      granted: false,
      error: "זמן הקבלת המיקום פג",
    });

    render(<LocationPermissionModal {...defaultProps} />);

    const enableButton = screen.getByText("אפשר גישה למיקום");
    fireEvent.click(enableButton);

    await waitFor(() => {
      expect(screen.getByText("זמן הקבלת המיקום פג")).toBeInTheDocument();
    });
  });

  it("should handle generic location error", async () => {
    mockGetCurrentLocation.mockResolvedValue({
      granted: false,
      error: "שגיאה בקבלת מיקום",
    });

    render(<LocationPermissionModal {...defaultProps} />);

    const enableButton = screen.getByText("אפשר גישה למיקום");
    fireEvent.click(enableButton);

    await waitFor(() => {
      expect(screen.getByText("שגיאה בקבלת מיקום")).toBeInTheDocument();
    });
  });

  it("should handle getCurrentLocation throwing an error", async () => {
    mockGetCurrentLocation.mockRejectedValue(new Error("Network error"));

    render(<LocationPermissionModal {...defaultProps} />);

    const enableButton = screen.getByText("אפשר גישה למיקום");
    fireEvent.click(enableButton);

    await waitFor(() => {
      expect(screen.getByText("שגיאה בקבלת המיקום")).toBeInTheDocument();
    });
  });

  it("should handle updateCurrentUserLocation failure", async () => {
    const mockCoordinates = {
      latitude: 32.0853,
      longitude: 34.7818,
    };

    mockGetCurrentLocation.mockResolvedValue({
      granted: true,
      coordinates: mockCoordinates,
    });

    mockUpdateCurrentUserLocation.mockResolvedValue({
      status: "error",
      error: "Failed to update user location",
    });

    render(<LocationPermissionModal {...defaultProps} />);

    const enableButton = screen.getByText("אפשר גישה למיקום");
    fireEvent.click(enableButton);

    await waitFor(() => {
      expect(mockUpdateCurrentUserLocation).toHaveBeenCalledWith(
        mockCoordinates.latitude,
        mockCoordinates.longitude
      );
    });

    // Should still proceed with URL update even if server update fails
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalled();
    });
  });

  it("should show loading state while processing", async () => {
    // Create a promise that we can control
    let resolveLocation: (value: any) => void;
    const locationPromise = new Promise((resolve) => {
      resolveLocation = resolve;
    });

    mockGetCurrentLocation.mockReturnValue(locationPromise as any);

    render(<LocationPermissionModal {...defaultProps} />);

    const enableButton = screen.getByText("אפשר גישה למיקום");
    fireEvent.click(enableButton);

    // Button should show loading state
    expect(enableButton).toBeDisabled();

    // Resolve the promise
    resolveLocation!({
      granted: true,
      coordinates: { latitude: 32.0853, longitude: 34.7818 },
    });

    await waitFor(() => {
      expect(enableButton).not.toBeDisabled();
    });
  });

  it("should update URL with correct parameters", async () => {
    const mockCoordinates = {
      latitude: 32.0853,
      longitude: 34.7818,
    };

    mockGetCurrentLocation.mockResolvedValue({
      granted: true,
      coordinates: mockCoordinates,
    });

    mockUpdateCurrentUserLocation.mockResolvedValue({
      status: "success",
      data: {
        userId: "123",
        latitude: 32.0853,
        longitude: 34.7818,
        locationEnabled: true,
      },
    });

    render(<LocationPermissionModal {...defaultProps} />);

    const enableButton = screen.getByText("אפשר גישה למיקום");
    fireEvent.click(enableButton);

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith(
        expect.stringMatching(
          /\/members\?.*userLat=32\.0853.*userLon=34\.7818.*sortByDistance=true.*includeSelf=true/
        )
      );
    });
  });

  it("should call onLocationGranted callback when location is granted", async () => {
    const mockCoordinates = {
      latitude: 32.0853,
      longitude: 34.7818,
    };

    mockGetCurrentLocation.mockResolvedValue({
      granted: true,
      coordinates: mockCoordinates,
    });

    mockUpdateCurrentUserLocation.mockResolvedValue({
      status: "success",
      data: {
        userId: "123",
        latitude: 32.0853,
        longitude: 34.7818,
        locationEnabled: true,
      },
    });

    render(<LocationPermissionModal {...defaultProps} />);

    const enableButton = screen.getByText("אפשר גישה למיקום");
    fireEvent.click(enableButton);

    await waitFor(() => {
      expect(defaultProps.onLocationGranted).toHaveBeenCalledWith(
        mockCoordinates
      );
    });
  });

  it("should not call onLocationGranted when location is denied", async () => {
    mockGetCurrentLocation.mockResolvedValue({
      granted: false,
      error: "הרשאת מיקום נדחתה",
    });

    render(<LocationPermissionModal {...defaultProps} />);

    const enableButton = screen.getByText("אפשר גישה למיקום");
    fireEvent.click(enableButton);

    await waitFor(() => {
      expect(defaultProps.onLocationGranted).not.toHaveBeenCalled();
    });
  });
});
