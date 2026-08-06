import type { FormAction } from "@/types/forms";

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
};

export type CoursePublicationControlProps = {
  canPublish: boolean;
  courseId: string;
  isPublished: boolean;
};
