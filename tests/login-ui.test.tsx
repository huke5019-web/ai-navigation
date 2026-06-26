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

    expect(screen.getByLabelText("管理员账号")).toHaveAttribute(
      "autocomplete",
      "username",
    );
    expect(screen.getByLabelText("密码")).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
    expect(screen.getByRole("button", { name: "登录" })).toBeEnabled();
  });

  it("announces a login error", async () => {
    loginActionMock.mockResolvedValue({ error: "账号或密码错误" });
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("管理员账号"), {
      target: { value: "admin" },
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "wrong" },
    });
    fireEvent.submit(screen.getByRole("button", { name: "登录" }).closest("form")!);

    expect(await screen.findByText("账号或密码错误")).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });

  it("disables credentials and submit control while pending", async () => {
    loginActionMock.mockImplementation(() => new Promise(() => undefined));
    render(<LoginForm />);

    fireEvent.submit(screen.getByRole("button", { name: "登录" }).closest("form")!);

    await waitFor(() => {
      expect(screen.getByLabelText("管理员账号")).toBeDisabled();
      expect(screen.getByLabelText("密码")).toBeDisabled();
      expect(screen.getByRole("button", { name: "正在登录..." })).toBeDisabled();
    });
  });
});
