/**
 * useDrawings.ts
 * React Query hooks for the Drawings & Documents module.
 * All hooks call the live backend actor via useActor(createActor).
 */
import { createActor } from "@/backend";
import type { Drawing, DrawingNotification, ReviewRequest } from "@/backend";
import { DrawingCategory, DrawingFileType } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type { Drawing, DrawingNotification, ReviewRequest };
export { DrawingCategory, DrawingFileType };

// ─── Query keys ────────────────────────────────────────────────────────────────

const KEYS = {
  drawings: ["drawings"] as const,
  reviewRequests: ["drawing-review-requests"] as const,
  notifications: ["drawing-notifications"] as const,
};

// ─── Add Drawing input ─────────────────────────────────────────────────────────

export interface AddDrawingInput {
  name: string;
  category: DrawingCategory;
  fileType: DrawingFileType;
  storageKey: string;
  description: string;
}

// ─── Drawings hooks ────────────────────────────────────────────────────────────

export function useDrawingsList() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Drawing[]>({
    queryKey: KEYS.drawings,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDrawings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddDrawing() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AddDrawingInput) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.addDrawing(
        input.name,
        input.category,
        input.fileType,
        input.storageKey,
        input.description,
      );
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.drawings });
    },
  });
}

export function useDeleteDrawing() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteDrawing(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.drawings });
      queryClient.invalidateQueries({ queryKey: KEYS.reviewRequests });
    },
  });
}

// ─── Review Request hooks ──────────────────────────────────────────────────────

export function useReviewRequests() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ReviewRequest[]>({
    queryKey: KEYS.reviewRequests,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getReviewRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateReviewRequest() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { drawingId: string; notes: string }) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.createReviewRequest(
        input.drawingId,
        input.notes,
      );
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.reviewRequests });
      queryClient.invalidateQueries({ queryKey: KEYS.notifications });
    },
  });
}

export function useUpdateReviewRequest() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      status: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.updateReviewRequest(
        input.id,
        input.status,
        input.notes,
      );
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.reviewRequests });
    },
  });
}

export function useDeleteReviewRequest() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteReviewRequest(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.reviewRequests });
    },
  });
}

// ─── Notification hooks ────────────────────────────────────────────────────────

export function useDrawingNotifications() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<DrawingNotification[]>({
    queryKey: KEYS.notifications,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDrawingNotifications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDismissDrawingNotification() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.dismissDrawingNotification(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.notifications });
    },
  });
}
