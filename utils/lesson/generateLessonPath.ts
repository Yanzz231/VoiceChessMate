import { Dimensions } from "react-native";
import { LESSON_DATA } from "@/constants/lessonData";
import { LessonNode } from "@/types/lesson";

const { width } = Dimensions.get("window");

export const generateLessonPath = (
  progress: Record<string, boolean>
): LessonNode[] => {
  const nodes: LessonNode[] = [];
  const sections = Object.keys(LESSON_DATA);
  let currentY = 80;
  let nodeIndex = 0;

  sections.forEach((sectionId, sectionIndex) => {
    const section = LESSON_DATA[sectionId];

    nodes.push({
      id: `header_${sectionId}`,
      title: section.title,
      subtitle: section.subtitle,
      type: "section-header",
      locked: false,
      completed: false,
      stars: 0,
      progress: 0,
      x: width / 2,
      y: currentY,
      sectionId,
    });
    currentY += 100;

    section.courses.forEach((course, courseIndex) => {
      let xPosition;
      if (nodeIndex % 3 === 0) {
        xPosition = width / 2;
      } else if (nodeIndex % 3 === 1) {
        xPosition = width * 0.28;
      } else {
        xPosition = width * 0.72;
      }

      const courseProgressKey = `course_${course.id}_completed`;
      const isCompleted = progress[courseProgressKey] === true;
      const isFirstCourse = sectionIndex === 0 && courseIndex === 0;

      let isUnlocked = isFirstCourse;
      if (!isFirstCourse && nodeIndex > 0) {
        const previousCourseNode = nodes[nodes.length - 1];
        if (
          previousCourseNode.type === "lesson" &&
          previousCourseNode.courseId
        ) {
          const prevProgressKey = `course_${previousCourseNode.courseId}_completed`;
          isUnlocked = progress[prevProgressKey] === true;
        }
      }

      nodes.push({
        id: `course_${course.id}`,
        title: course.title,
        subtitle: course.description,
        type: "lesson",
        locked: !isUnlocked,
        completed: isCompleted,
        stars: isCompleted ? 3 : 0,
        progress: isCompleted ? 100 : 0,
        x: xPosition,
        y: currentY,
        sectionId,
        courseId: course.id,
        fen: course.fen,
        objective: course.objective,
        description: course.description,
      });

      currentY += 150;
      nodeIndex++;
    });

    currentY += 50;
  });

  return nodes;
};

export const calculatePathHeight = (nodes: LessonNode[]): number => {
  if (nodes.length === 0) return 1120;

  const maxY = Math.max(...nodes.map((n) => n.y));
  return maxY + 200;
};
