import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Selection } from "@nextui-org/react";
import { useState, useEffect, useCallback } from "react";
import { FaMale, FaFemale } from "react-icons/fa";
import useFilterStore from "./useFilterStore";
import usePaginationStore from "./usePaginationStore";

const DEFAULT_FILTERS = {
  gender: ["male", "female"],
  ageRange: [18, 65],
  orderBy: "updated",
  withPhoto: true,
  pageSize: 15,
};

export const useFilters = () => {
  const pathname = usePathname();
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const [clientLoaded, setClientLoaded] = useState(false);
  // Removed unused useTransition

  useEffect(() => {
    setClientLoaded(true);
  }, []);

  const { filters, setFilters } = useFilterStore();
  const { totalCount } = usePaginationStore((state) => state.pagination);
  const setPage = usePaginationStore((state) => state.setPage);

  // 1. Sync FROM URL TO Store (Source of Truth)
  useEffect(() => {
    if (!clientLoaded) return;

    // Read params with fallbacks to defaults
    const urlOrderBy =
      currentSearchParams.get("orderBy") || DEFAULT_FILTERS.orderBy;

    const urlGender = currentSearchParams.get("gender");
    const urlAgeRange = currentSearchParams.get("ageRange");
    const urlWithPhoto = currentSearchParams.get("withPhoto");

    const currentFilters = useFilterStore.getState().filters;

    // Sync orderBy
    if (urlOrderBy !== currentFilters.orderBy) {
      setFilters("orderBy", urlOrderBy);
    }

    // Sync gender
    const newGender = urlGender
      ? urlGender.split(",").filter(Boolean)
      : DEFAULT_FILTERS.gender;
    const currentGenderStr = [...currentFilters.gender].sort().join(",");
    const newGenderStr = [...newGender].sort().join(",");

    if (currentGenderStr !== newGenderStr) {
      setFilters("gender", newGender);
    }

    // Sync ageRange
    let newAgeRange = DEFAULT_FILTERS.ageRange;
    if (urlAgeRange) {
      const [min, max] = urlAgeRange.split(",").map(Number);
      if (min && max) newAgeRange = [min, max];
    }
    if (
      currentFilters.ageRange[0] !== newAgeRange[0] ||
      currentFilters.ageRange[1] !== newAgeRange[1]
    ) {
      setFilters("ageRange", newAgeRange);
    }

    // Sync withPhoto
    const newWithPhoto =
      urlWithPhoto !== null
        ? urlWithPhoto === "true"
        : DEFAULT_FILTERS.withPhoto;
    if (newWithPhoto !== currentFilters.withPhoto) {
      setFilters("withPhoto", newWithPhoto);
    }

    // Sync location params (Optional - no defaults)
    const urlUserLat = currentSearchParams.get("userLat");
    const urlUserLon = currentSearchParams.get("userLon");
    const urlDistance = currentSearchParams.get("distance");
    const urlSortByDistance = currentSearchParams.get("sortByDistance");

    if (urlUserLat !== currentFilters.userLat) {
      setFilters("userLat", urlUserLat || undefined);
    }
    if (urlUserLon !== currentFilters.userLon) {
      setFilters("userLon", urlUserLon || undefined);
    }
    if (urlDistance !== currentFilters.distance) {
      setFilters("distance", urlDistance || undefined);
    }
    if (urlSortByDistance !== currentFilters.sortByDistance) {
      setFilters("sortByDistance", urlSortByDistance || undefined);
    }

    // Sync pageNumber
    const urlPageNumber = currentSearchParams.get("pageNumber");
    if (urlPageNumber) {
      const pageNum = Number(urlPageNumber);
      const currentPage = usePaginationStore.getState().pagination.pageNumber;
      if (!isNaN(pageNum) && pageNum > 0 && pageNum !== currentPage) {
        setPage(pageNum);
      }
    }
  }, [clientLoaded, currentSearchParams, setFilters, setPage]);

  // Helper to update URL
  const updateUrl = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(currentSearchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Reset page to 1 on filter change
      if (!updates.pageNumber) {
        params.delete("pageNumber");
        setPage(1);
      }

      const newUrl = `${pathname}?${params.toString()}`;
      router.replace(newUrl, { scroll: false });
    },
    [currentSearchParams, pathname, router, setPage]
  );

  // Event handlers - Update Store AND URL
  const handleOrderSelect = (value: Selection) => {
    if (value instanceof Set) {
      const newVal = value.values().next().value;
      if (typeof newVal === "string") {
        setFilters("orderBy", newVal);
        updateUrl({ orderBy: newVal });
      }
    }
  };

  const handleAgeSelect = (value: number[]) => {
    setFilters("ageRange", value);
    updateUrl({ ageRange: `${value[0]},${value[1]}` });
  };

  const handleGenderSelect = (value: string) => {
    const currentGenders = filters.gender;
    let newGender;
    if (currentGenders.includes(value)) {
      newGender = currentGenders.filter((g) => g !== value);
    } else {
      newGender = [...currentGenders, value];
    }
    setFilters("gender", newGender);
    updateUrl({ gender: newGender.join(",") });
  };

  const handleWithPhotoToggle = (event: any) => {
    let newVal;
    if (typeof event === "boolean") {
      newVal = event;
    } else if (event && typeof event.target?.checked === "boolean") {
      newVal = event.target.checked;
    } else {
      newVal = !filters.withPhoto;
    }
    setFilters("withPhoto", newVal);
    updateUrl({ withPhoto: String(newVal) });
  };

  const orderByList = [
    { label: "פעילות אחרונה", value: "updated" },
    { label: "משתמשים חדשים ביותר", value: "newest" },
    { label: "לפי מרחק", value: "distance" },
  ];

  const gendersList = [
    { value: "male", icon: FaMale },
    { value: "female", icon: FaFemale },
  ];

  return {
    orderByList,
    gendersList,
    selectAge: handleAgeSelect,
    selectGender: handleGenderSelect,
    selectOrder: handleOrderSelect,
    selectWithPhoto: handleWithPhotoToggle,
    filters,
    clientLoaded,
    totalCount,
  };
};
