import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Coursecard from "../components/courseCard";

describe("Coursecard Component", () => {
  it("renders course details with challenge array present", () => {
    const course = {
      id: 1,
      name: "React Mastery",
      category: "Frontend",
      level: "Intermediate",
      desc: "Learn advanced React patterns",
      chapters: [{ id: 1, title: "Hooks" }],
      challenge: [{ id: 1, title: "Build custom hook" }],
    };

    render(
      <MemoryRouter>
        <Coursecard course={course} progress={50} />
      </MemoryRouter>
    );

    expect(screen.getByText("React Mastery")).toBeDefined();
    expect(screen.getByText("1 chapters")).toBeDefined();
    expect(screen.getByText("50% complete")).toBeDefined();
    expect(screen.getByText("1 challenge")).toBeDefined();
  });

  it("handles course without challenge property gracefully (guard regression test)", () => {
    const courseWithoutChallenge = {
      id: 2,
      title: "Backend Express",
      category: "Backend",
      level: "Beginner",
      description: "Node.js and Express APIs",
      chapters: [{ id: 1, title: "Routes" }],
      // challenge is explicitly omitted
    };

    render(
      <MemoryRouter>
        <Coursecard course={courseWithoutChallenge} progress={0} />
      </MemoryRouter>
    );

    expect(screen.getByText("Backend Express")).toBeDefined();
    expect(screen.getByText("0 challenge")).toBeDefined();
  });
});
