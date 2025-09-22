import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Selection } from "@nextui-org/react";
import { useState, useEffect, useTransition } from "react";
import { FaMale, FaFemale } from "react-icons/fa";
import useFilterStore from "./useFilterStore";
import usePaginationStore from "./usePaginationStore";

export const useFilters = () => {
  const pathname = usePathname();
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const [clientLoaded, setClientLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

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

    const urlOrderBy = currentSearchParams.get("orderBy");
    const urlGender = currentSearchParams.get("gender");
    const urlAgeRange = currentSearchParams.get("ageRange");
    const urlWithPhoto = currentSearchParams.get("withPhoto");
    const urlUserLat = currentSearchParams.get("userLat");
    const urlUserLon = currentSearchParams.get("userLon");
    const urlDistance = currentSearchParams.get("distance");
    const urlSortByDistance = currentSearchParams.get("sortByDistance");

    const currentFilters = useFilterStore.getState().filters;

    if (urlOrderBy && urlOrderBy !== currentFilters.orderBy) {
      setFilters("orderBy", urlOrderBy);
    }

    if (urlGender) {
      const genderArray = urlGender.split(",").filter(Boolean);

      const currentGenderStr = [...currentFilters.gender].sort().join(",");
      const urlGenderStr = [...genderArray].sort().join(",");

      if (currentGenderStr !== urlGenderStr) {
        setFilters("gender", genderArray);
      }
    }

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

    if (urlWithPhoto !== null) {
      const withPhotoValue = urlWithPhoto === "true";
      if (withPhotoValue !== currentFilters.withPhoto) {
        setFilters("withPhoto", withPhotoValue);
      }
    }

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
  }, [clientLoaded, currentSearchParams, setFilters]);

  useEffect(() => {
    if (
      gender ||
      ageRange ||
      orderBy !== undefined ||
      withPhoto !== undefined
    ) {
      setPage(1);
    }
  }, [ageRange, gender, orderBy, setPage, withPhoto]);

  useEffect(() => {
    startTransition(() => {
      const searchParams = new URLSearchParams(currentSearchParams.toString());

      const currentGender = searchParams.get("gender");
      const currentAgeRange = searchParams.get("ageRange");
      const currentOrderBy = searchParams.get("orderBy");
      const currentWithPhoto = searchParams.get("withPhoto");

      const genderParam =
        gender && gender.length > 0 ? gender.join(",") : "male,female";
      if (!currentGender || currentGender !== genderParam) {
        searchParams.set("gender", genderParam);
      }

      const ageRangeParam =
        ageRange && ageRange.length === 2
          ? `${ageRange[0]},${ageRange[1]}`
          : "18,100";
      if (!currentAgeRange || currentAgeRange !== ageRangeParam) {
        searchParams.set("ageRange", ageRangeParam);
      }

      if (!currentOrderBy) {
        searchParams.set("orderBy", orderBy || "updated");
      }

      const withPhotoParam = withPhoto.toString();
      if (!currentWithPhoto || currentWithPhoto !== withPhotoParam) {
        searchParams.set("withPhoto", withPhotoParam);
      }

      if (pageSize) searchParams.set("pageSize", pageSize.toString());
      if (pageNumber) searchParams.set("pageNumber", pageNumber.toString());

      if (userLat) searchParams.set("userLat", userLat);
      if (userLon) searchParams.set("userLon", userLon);
      if (distance) searchParams.set("distance", distance);
      if (sortByDistance) searchParams.set("sortByDistance", sortByDistance);

      const newUrl = `${pathname}?${searchParams.toString()}`;
      const currentUrl = `${pathname}?${currentSearchParams.toString()}`;

      if (newUrl !== currentUrl) {
        router.replace(newUrl, { scroll: false });
      }
    });
  }, [
    ageRange,
    gender,
    orderBy,
    pathname,
    router,
    currentSearchParams,
    pageNumber,
    pageSize,
    withPhoto,
    userLat,
    userLon,
    distance,
    sortByDistance,
  ]);

  const orderByList = [
    { label: "פעילות אחרונה", value: "updated" },
    { label: "משתמשים חדשים ביותר", value: "newest" },
    { label: "לפי מרחק", value: "distance" },
  ];
  const gendersList = [
    { value: "male", icon: FaMale },
    { value: "female", icon: FaFemale },
  ];

  const handleOrderSelect = (value: Selection) => {
    if (value instanceof Set) {
      setFilters("orderBy", value.values().next().value);
    }
  };

  const handleAgeSelect = (value: number[]) => {
    setFilters("ageRange", value);
  };

  const handleGenderSelect = (value: string) => {
    if (gender.includes(value))
      setFilters(
        "gender",
        gender.filter((g) => g !== value)
      );
    else setFilters("gender", [...gender, value]);
  };

  const handleWithPhotoToggle = (event: any) => {
    if (typeof event === "boolean") {
      setFilters("withPhoto", event);
    } else if (event && typeof event.target?.checked === "boolean") {
      setFilters("withPhoto", event.target.checked);
    } else {
      setFilters("withPhoto", !withPhoto);
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
