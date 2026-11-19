import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "../App";

describe("Application Routing", () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = "#/";
  });

  it("redirects unauthenticated users to /login", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("COURSEFORGE")).toBeDefined();
      expect(screen.getByText("Enter CourseForge")).toBeDefined();
    });
  });
});
