import { QueryClient, useQuery } from "react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnmount: false,
      staleTime: 1000 * 60 * 60,
    },
  },
});

export const useRouteTableData = () => {
  const { data = [], isLoading } = useQuery("fetchRouteData", () => {});
  const localRouteDetails =
    JSON.parse(localStorage.getItem("routes_data")) || [];
  return { data: data.length ? data : localRouteDetails, isLoading };
};

export const useFetchStopsDetails = () => {
  const { data = [], isLoading } = useQuery("fetchStopsData", () => {});
  const localStopDetails = JSON.parse(localStorage.getItem("stops_data")) || [];
  return { data: data.length ? data : localStopDetails, isLoading };
};

export const updateData = (key, newData) => {
  queryClient.setQueryData(key, () => newData);
};
