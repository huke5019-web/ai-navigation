import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const loginActionMock = vi.hoisted(() => vi.fn());
vi.mock("@/app/admin/actions", () => ({
  loginAction: loginActionMock,
}));

import { LoginForm } from "@/components/admin/login-form";

describe("admin login form", () => {
  beforeEach(() => {
    loginActionMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders accessible credentials fields and submit control", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("Admin username")).toHaveAttribute(
      "autocomplete",
      "username",
    );
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
  });

  it("announces a login error", async () => {
    loginActionMock.mockResolvedValue({ error: "Invalid username or password." });
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Admin username"), {
      target: { value: "admin" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong" },
    });
    fireEvent.submit(screen.getByRole("button", { name: "Sign in" }).closest("form")!);

    expect(await screen.findByText("Invalid username or password.")).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });

  it("disables credentials and submit control while pending", async () => {
    loginActionMock.mockImplementation(() => new Promise(() => undefined));
    render(<LoginForm />);

    fireEvent.submit(screen.getByRole("button", { name: "Sign in" }).closest("form")!);

    await waitFor(() => {
      expect(screen.getByLabelText("Admin username")).toBeDisabled();
      expect(screen.getByLabelText("Password")).toBeDisabled();
      expect(screen.getByRole("button", { name: "Signing in..." })).toBeDisabled();
    });
  });
});
