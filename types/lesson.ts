export interface LessonNode {
  id: string;
  title: string;
  subtitle: string;
  type: "lesson" | "section-header";
  locked: boolean;
  completed: boolean;
  stars: number;
  progress: number;
  x: number;
  y: number;
  sectionId?: string;
  courseId?: string;
  fen?: string;
  objective?: string;
  description?: string;
}

export type TabType = "home" | "play" | "scan" | "analyze" | "settings";
