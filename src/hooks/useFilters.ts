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

  const { ageRange, gender, orderBy, withPhoto } = filters;

  // Sync store with URL parameters on mount and URL changes
  useEffect(() => {
    if (!clientLoaded) return;

    const urlOrderBy = currentSearchParams.get("orderBy");
    const urlGender = currentSearchParams.get("gender");
    const urlAgeRange = currentSearchParams.get("ageRange");
    const urlWithPhoto = currentSearchParams.get("withPhoto");

    // Update store if URL has different values
    if (urlOrderBy && urlOrderBy !== orderBy) {
      setFilters("orderBy", urlOrderBy);
    }

    if (urlGender) {
      const genderArray = urlGender.split(",");
      if (
        JSON.stringify(genderArray.sort()) !== JSON.stringify(gender.sort())
      ) {
        setFilters("gender", genderArray);
      }
    }

    if (urlAgeRange) {
      const [min, max] = urlAgeRange.split(",").map(Number);
      if (min && max && (ageRange[0] !== min || ageRange[1] !== max)) {
        setFilters("ageRange", [min, max]);
      }
    }

    if (urlWithPhoto !== null) {
      const withPhotoValue = urlWithPhoto === "true";
      if (withPhotoValue !== withPhoto) {
        setFilters("withPhoto", withPhotoValue);
      }
    }
  }, [
    clientLoaded,
    currentSearchParams,
    orderBy,
    gender,
    ageRange,
    withPhoto,
    setFilters,
  ]);

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
      // Start from existing params to preserve location and other flags
      const searchParams = new URLSearchParams(currentSearchParams.toString());

      // Only update parameters that are not already set in URL or are different from store
      const currentGender = searchParams.get("gender");
      const currentAgeRange = searchParams.get("ageRange");
      const currentOrderBy = searchParams.get("orderBy");
      const currentWithPhoto = searchParams.get("withPhoto");

      // Update gender only if not set in URL or different from store
      const genderParam =
        gender && gender.length > 0 ? gender.join(",") : "male,female";
      if (!currentGender || currentGender !== genderParam) {
        searchParams.set("gender", genderParam);
      }

      // Update ageRange only if not set in URL or different from store
      const ageRangeParam =
        ageRange && ageRange.length === 2
          ? `${ageRange[0]},${ageRange[1]}`
          : "18,100";
      if (!currentAgeRange || currentAgeRange !== ageRangeParam) {
        searchParams.set("ageRange", ageRangeParam);
      }

      // Don't override orderBy if it's already set in URL (let FilterButtons control it)
      if (!currentOrderBy) {
        searchParams.set("orderBy", orderBy || "updated");
      }

      // Update withPhoto only if not set in URL or different from store
      const withPhotoParam = withPhoto.toString();
      if (!currentWithPhoto || currentWithPhoto !== withPhotoParam) {
        searchParams.set("withPhoto", withPhotoParam);
      }

      // Always set pageSize and pageNumber
      if (pageSize) searchParams.set("pageSize", pageSize.toString());
      if (pageNumber) searchParams.set("pageNumber", pageNumber.toString());

      const newUrl = `${pathname}?${searchParams.toString()}`;
      const currentUrl = `${pathname}?${currentSearchParams.toString()}`;

      // Avoid redundant replace if nothing changed
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
