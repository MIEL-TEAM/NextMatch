import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Selection } from "@nextui-org/react";
import { useState, useEffect, useTransition, useRef } from "react";
import { FaMale, FaFemale } from "react-icons/fa";
import useFilterStore from "./useFilterStore";
import usePaginationStore from "./usePaginationStore";

export const useFilters = () => {
  const pathname = usePathname();
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const [clientLoaded, setClientLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isSyncing = useRef(false);
  const lastSyncedUrl = useRef<string>("");

  useEffect(() => {
    setClientLoaded(true);
  }, []);

  const { filters, setFilters } = useFilterStore();

  const { pageNumber, pageSize, totalCount } = usePaginationStore(
    (state) => state.pagination
  );
  const setPage = usePaginationStore((state) => state.setPage);

  const {
    ageRange,
    gender,
    orderBy,
    withPhoto,
    userLat,
    userLon,
    distance,
    sortByDistance,
  } = filters;

  useEffect(() => {
    if (!clientLoaded) return;

    if (isSyncing.current) return;

    const urlOrderBy = currentSearchParams.get("orderBy");
    const urlGender = currentSearchParams.get("gender");
    const urlAgeRange = currentSearchParams.get("ageRange");
    const urlWithPhoto = currentSearchParams.get("withPhoto");
    const urlUserLat = currentSearchParams.get("userLat");
    const urlUserLon = currentSearchParams.get("userLon");
    const urlDistance = currentSearchParams.get("distance");
    const urlSortByDistance = currentSearchParams.get("sortByDistance");

    const currentFilters = useFilterStore.getState().filters;

    // Sync orderBy
    if (urlOrderBy && urlOrderBy !== currentFilters.orderBy) {
      setFilters("orderBy", urlOrderBy);
    }

    // Sync gender
    if (urlGender) {
      const genderArray = urlGender.split(",").filter(Boolean);
      const currentGenderStr = [...currentFilters.gender].sort().join(",");
      const urlGenderStr = [...genderArray].sort().join(",");

      if (currentGenderStr !== urlGenderStr) {
        setFilters("gender", genderArray);
      }
    }

    // Sync ageRange
    if (urlAgeRange) {
      const [min, max] = urlAgeRange.split(",").map(Number);
      if (
        min &&
        max &&
        (currentFilters.ageRange[0] !== min ||
          currentFilters.ageRange[1] !== max)
      ) {
        setFilters("ageRange", [min, max]);
      }
    }

    // Sync withPhoto
    if (urlWithPhoto !== null) {
      const withPhotoValue = urlWithPhoto === "true";
      if (withPhotoValue !== currentFilters.withPhoto) {
        setFilters("withPhoto", withPhotoValue);
      }
    }

    // Sync location params
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

    const urlPageNumber = currentSearchParams.get("pageNumber");
    if (urlPageNumber) {
      const pageNum = Number(urlPageNumber);
      const currentPage = usePaginationStore.getState().pagination.pageNumber;

      // Only update if the URL value is different from store AND is a valid number
      if (!isNaN(pageNum) && pageNum > 0 && pageNum !== currentPage) {
        console.log(
          "🔗 Syncing pageNumber from URL:",
          urlPageNumber,
          "→",
          pageNum
        );
        setPage(pageNum);
      }
    }
  }, [clientLoaded, currentSearchParams, setFilters, setPage]);

  useEffect(() => {
    console.log("🔄 Filter changed, resetting pagination to page 1");
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ageRange, gender, orderBy, withPhoto]);

  useEffect(() => {
    if (!clientLoaded) return;

    // Guard: Don't rewrite URL if only location params changed
    // This prevents infinite loop with useLocationFlow
    const currentUrlLat = currentSearchParams.get("userLat");
    const currentUrlLon = currentSearchParams.get("userLon");
    const onlyLocationChanged =
      currentUrlLat === userLat &&
      currentUrlLon === userLon &&
      currentUrlLat !== null &&
      currentUrlLon !== null;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const searchParams = new URLSearchParams(currentSearchParams.toString());

    // Build params from store
    const genderParam =
      gender && gender.length > 0 ? gender.join(",") : "male,female";
    searchParams.set("gender", genderParam);

    const ageRangeParam =
      ageRange && ageRange.length === 2
        ? `${ageRange[0]},${ageRange[1]}`
        : "18,65";
    searchParams.set("ageRange", ageRangeParam);

    searchParams.set("orderBy", orderBy || "updated");
    searchParams.set("withPhoto", withPhoto.toString());

    if (pageSize) searchParams.set("pageSize", pageSize.toString());

    // Only add pageNumber to URL if it's valid and greater than 1
    // (page 1 can be omitted from URL as it's the default)
    if (pageNumber && pageNumber > 1) {
      searchParams.set("pageNumber", pageNumber.toString());
    } else {
      searchParams.delete("pageNumber"); // Clean URL for page 1
    }

    // Preserve existing location params if they exist and match store
    // Only update if store has location but URL doesn't, or if they differ
    if (userLat) {
      if (currentUrlLat !== userLat) {
        searchParams.set("userLat", userLat);
      }
    }
    if (userLon) {
      if (currentUrlLon !== userLon) {
        searchParams.set("userLon", userLon);
      }
    }
    if (distance) searchParams.set("distance", distance);
    if (sortByDistance) searchParams.set("sortByDistance", sortByDistance);

    const newUrl = `${pathname}?${searchParams.toString()}`;
    const currentFullUrl = `${pathname}?${currentSearchParams.toString()}`;

    // Skip update if new URL matches current URL exactly
    if (newUrl === currentFullUrl) {
      lastSyncedUrl.current = newUrl;
      return;
    }

    // Skip update if only location params changed (useLocationFlow handles those)
    if (onlyLocationChanged && newUrl === lastSyncedUrl.current) {
      return;
    }

    if (newUrl !== lastSyncedUrl.current) {
      lastSyncedUrl.current = newUrl;
      isSyncing.current = true;

      startTransition(() => {
        router.replace(newUrl, { scroll: false });

        setTimeout(() => {
          isSyncing.current = false;
        }, 100);
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    clientLoaded,
    ageRange,
    gender,
    orderBy,
    pathname,
    router,
    pageNumber,
    pageSize,
    withPhoto,
    userLat,
    userLon,
    distance,
    sortByDistance,
  ]);

  // UI lists
  const orderByList = [
    { label: "פעילות אחרונה", value: "updated" },
    { label: "משתמשים חדשים ביותר", value: "newest" },
    { label: "לפי מרחק", value: "distance" },
  ];

  const gendersList = [
    { value: "male", icon: FaMale },
    { value: "female", icon: FaFemale },
  ];

  // Event handlers
  const handleOrderSelect = (value: Selection) => {
    if (value instanceof Set) {
      setFilters("orderBy", value.values().next().value);
    }
  };

  const handleAgeSelect = (value: number[]) => {
    setFilters("ageRange", value);
  };

  const handleGenderSelect = (value: string) => {
    if (gender.includes(value)) {
      setFilters(
        "gender",
        gender.filter((g) => g !== value)
      );
    } else {
      setFilters("gender", [...gender, value]);
    }
  };

  const handleWithPhotoToggle = (event: any) => {
    if (typeof event === "boolean") {
      setFilters("withPhoto", event);
    } else if (event && typeof event.target?.checked === "boolean") {
      setFilters("withPhoto", event.target.checked);
    } else {
      const currentValue = useFilterStore.getState().filters.withPhoto;
      setFilters("withPhoto", !currentValue);
    }
  };

  return {
    orderByList,
    gendersList,
    selectAge: handleAgeSelect,
    selectGender: handleGenderSelect,
    selectOrder: handleOrderSelect,
    selectWithPhoto: handleWithPhotoToggle,
    filters,
    clientLoaded,
    isPending,
    totalCount,
  };
};
