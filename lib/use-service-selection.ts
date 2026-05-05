"use client";

import { useMemo } from "react";
import { useServiceSelectionStore, type ServiceSelectionValue } from "@/lib/zustand";

type ProjectServiceSelectionLike = Partial<ServiceSelectionValue> | undefined;

const assignSelectionValue = <K extends keyof ServiceSelectionValue>(
  selection: ServiceSelectionValue,
  key: K,
  value: ServiceSelectionValue[K] | undefined
) => {
  if (value !== undefined) {
    selection[key] = value;
  }
};

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
    assignSelectionValue(merged, key, projectSelection[key]);
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
