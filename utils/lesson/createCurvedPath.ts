import { LessonNode } from "@/types/lesson";

export const createCurvedPath = (nodes: LessonNode[]) => {
  if (nodes.length < 2) return "";

  const lessonNodes = nodes.filter((n) => n.type === "lesson");
  if (lessonNodes.length < 2) return "";

  let pathData = `M ${lessonNodes[0].x} ${lessonNodes[0].y}`;

  for (let i = 0; i < lessonNodes.length - 1; i++) {
    const current = lessonNodes[i];
    const next = lessonNodes[i + 1];

    const controlY = (current.y + next.y) / 2;

    pathData += ` Q ${current.x} ${controlY}, ${next.x} ${next.y}`;
  }

  return pathData;
};
