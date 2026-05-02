"use client";

import { useMemo } from "react";
import { useServiceSelectionStore, type ServiceSelectionValue } from "@/lib/zustand";

type ProjectServiceSelectionLike = Partial<ServiceSelectionValue> | undefined;

const mergeDefinedSelection = (
  baseSelection: ServiceSelectionValue | null,
  projectSelection: ProjectServiceSelectionLike
): ServiceSelectionValue | null => {
  if (!baseSelection && !projectSelection) return null;

  const merged: ServiceSelectionValue = {
    ...(baseSelection ?? {}),
  };

  if (!projectSelection) {
    return merged;
  }

  (Object.keys(projectSelection) as Array<keyof ServiceSelectionValue>).forEach((key) => {
    const value = projectSelection[key];
    if (value !== undefined) {
      merged[key] = value;
    }
  });

  return merged;
};

export const useResolvedServiceSelection = (
  projectSelection?: ProjectServiceSelectionLike
) => {
  const storedSelection = useServiceSelectionStore((state) => state.selection);

  return useMemo(
    () => mergeDefinedSelection(storedSelection, projectSelection),
    [projectSelection, storedSelection]
  );
};
