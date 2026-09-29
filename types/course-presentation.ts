import type { ReactNode } from "react";

export type CoursePresentationVideo = {
  playbackId: string;
};

export type CoursePresentationConfig = {
  courseTitles: readonly string[];
  namespace: "Yoga";
  video: CoursePresentationVideo;
};

export type CoursePresentationProps = {
  title: string;
  subtitle: string | null;
  body?: string;
  coverImageUrl?: string | null;
  video?: CoursePresentationVideo;
  videoLabel?: string;
  backLabel: string;
  children?: ReactNode;
};
