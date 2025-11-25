import { UserFilters } from "@/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type FilterState = {
  filters: UserFilters;
  setFilters: (filterName: keyof FilterState["filters"], value: any) => void;
};

const useFilterStore = create<FilterState>()(
  devtools((set) => ({
    filters: {
      ageRange: [18, 65],
      gender: ["male", "female"],
      orderBy: "updated",
      withPhoto: true,
      // Location parameters
      userLat: undefined,
      userLon: undefined,
      distance: undefined,
      sortByDistance: undefined,
    },
    setFilters: (filterName, value) =>
      set((state) => {
        return {
          filters: { ...state.filters, [filterName]: value },
        };
      }),
  }))
);

export default useFilterStore;
