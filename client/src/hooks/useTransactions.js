import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionAPI } from "../utils/api";

export const useTransactions = (params = {}) => {
  return useQuery({
    queryKey: ["transactions", params],
    queryFn: () => transactionAPI.getTransactions(params),
    keepPreviousData: true,
  });
};

export const useTransactionSummary = (params = {}) => {
  return useQuery({
    queryKey: ["transaction-summary", params],
    queryFn: () => transactionAPI.getSummary(params),
    keepPreviousData: true,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionAPI.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-summary"] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }) => transactionAPI.updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-summary"] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionAPI.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-summary"] });
    },
  });
};
