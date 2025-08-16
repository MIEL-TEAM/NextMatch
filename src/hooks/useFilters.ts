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

      // Always set gender - if empty, use default
      const genderParam =
        gender && gender.length > 0 ? gender.join(",") : "male,female";
      searchParams.set("gender", genderParam);

      // Always set ageRange - if empty, use default
      const ageRangeParam =
        ageRange && ageRange.length === 2
          ? `${ageRange[0]},${ageRange[1]}`
          : "18,100";
      searchParams.set("ageRange", ageRangeParam);

      // Always set orderBy
      searchParams.set("orderBy", orderBy || "updated");

      // Always set pageSize and pageNumber
      if (pageSize) searchParams.set("pageSize", pageSize.toString());
      if (pageNumber) searchParams.set("pageNumber", pageNumber.toString());

      // Always set withPhoto
      searchParams.set("withPhoto", withPhoto.toString());

      const newUrl = `${pathname}?${searchParams.toString()}`;
      const currentUrl = `${pathname}?${currentSearchParams.toString()}`;

      // Avoid redundant replace if nothing changed
      if (newUrl !== currentUrl) {
        router.replace(newUrl);
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
    { label: "משתמשים חדשים ביותר", value: "created" },
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
