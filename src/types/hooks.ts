import { PagingResult, UserFilters } from "./index";

// Pagination Store
export type PaginationState = {
  pagination: PagingResult;
  setPagination: (count: number) => void;
};

// Filter Store
export type FilterState = {
  filters: UserFilters;
  setFilters: (filterName: keyof FilterState["filters"], value: any) => void;
};

// Presence Store
export type PresenceStore = {
  members: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  set: (members: string[]) => void;
};

// Device Routing
export type UseDeviceRoutingOptions = {
  enabled?: boolean;
  mobileThreshold?: number;
};
