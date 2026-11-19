import { useContext } from "react";
import { CourseContext } from "../context/courseContextDef";

export function useCourses() {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error("useCourses must be used within a CourseProvider");
  }
  return context;
}
