import type { FormAction } from "@/types/forms";
import type { AppMuxPlaybackPolicy } from "@/types/mux";

export type CourseFormDefaults = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  coverImageUrl: string | null;
};

export type CourseFormProps = {
  action: FormAction;
  defaults?: CourseFormDefaults;
  submitLabel: string;
  pendingLabel?: string;
};

export type CourseImageUploadProps = {
  defaultUrl?: string | null;
};

export type CoursePublicationModule = {
  videoPlaybackId: string | null;
  videoPlaybackPolicy: AppMuxPlaybackPolicy;
};

export type CoursePublicationControlProps = {
  canPublish: boolean;
  courseId: string;
  isPublished: boolean;
};

export type CourseDeletionState = {
  isPublished: boolean;
  publishedAt: Date | null;
  purchaseCount: number;
};

export type DeleteCourseButtonProps = {
  canDelete: boolean;
  courseId: string;
};
