import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { familyAPI } from "../utils/api";

export const useFamilyMembers = () => {
  return useQuery({
    queryKey: ["family-members"],
    queryFn: () => familyAPI.list(),
    select: (data) => data.members || [],
  });
};

export const useAddFamilyMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => familyAPI.add(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["family-members"] }),
  });
};

export const useUpdateFamilyMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => familyAPI.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["family-members"] }),
  });
};

export const useDeleteFamilyMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => familyAPI.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["family-members"] }),
  });
};
