"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createAdminSession,
  destroyAdminSession,
  parseAuthEnvironment,
  requireAdmin,
  verifyAdminCredentials,
} from "@/lib/auth";
import * as m from "@/lib/mutations";
import { loginSchema } from "@/lib/schemas";

export type ActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export type LoginActionState = {
  error?: string;
};

const INVALID_LOGIN_MESSAGE = "Invalid username or password.";
const ACTION_FAILED_MESSAGE = "The action could not be completed.";

const formDataToObject = (formData: FormData) => Object.fromEntries(formData.entries());

function fail(error: unknown): ActionState {
  if (error && typeof error === "object" && "fieldErrors" in error) {
    return {
      fieldErrors: (error as { fieldErrors: Record<string, string[]> }).fieldErrors,
    };
  }

  return {
    error: error instanceof Error ? error.message : ACTION_FAILED_MESSAGE,
  };
}

async function run(action: () => Promise<unknown>, paths: string[]) {
  await requireAdmin();

  try {
    await action();
    for (const path of paths) {
      revalidatePath(path);
    }
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}

export async function loginAction(
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  try {
    parseAuthEnvironment({
      ADMIN_USERNAME: process.env.ADMIN_USERNAME,
      ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
      SESSION_SECRET: process.env.SESSION_SECRET,
    });
  } catch {
    return { error: "Admin login is not configured yet." };
  }

  const result = loginSchema.safeParse(formDataToObject(formData));
  if (!result.success) {
    return { error: INVALID_LOGIN_MESSAGE };
  }

  const isValid = await verifyAdminCredentials(result.data.username, result.data.password);
  if (!isValid) {
    return { error: INVALID_LOGIN_MESSAGE };
  }

  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction(): Promise<never> {
  await destroyAdminSession();
  redirect("/admin/login");
}

export async function createCategoryAction(_: ActionState, formData: FormData) {
  return run(() => m.createCategory(formDataToObject(formData)), ["/", "/admin/categories"]);
}

export async function updateCategoryAction(id: number, _: ActionState, formData: FormData) {
  return run(() => m.updateCategory(id, formDataToObject(formData)), ["/", "/admin/categories"]);
}

export async function deleteCategoryAction(id: number) {
  return run(() => m.deleteCategory(id), ["/", "/admin/categories"]);
}

export async function createToolAction(_: ActionState, formData: FormData) {
  return run(() => m.createTool(formDataToObject(formData)), ["/", "/admin/tools", "/sitemap.xml"]);
}

export async function updateToolAction(id: number, _: ActionState, formData: FormData) {
  return run(() => m.updateTool(id, formDataToObject(formData)), ["/", "/admin/tools", "/sitemap.xml"]);
}

export async function deleteToolAction(id: number) {
  return run(() => m.deleteTool(id), ["/", "/admin/tools", "/sitemap.xml"]);
}

export async function createAdvertisementAction(_: ActionState, formData: FormData) {
  return run(() => m.createAdvertisement(formDataToObject(formData)), ["/", "/admin/ads"]);
}

export async function updateAdvertisementAction(id: number, _: ActionState, formData: FormData) {
  return run(() => m.updateAdvertisement(id, formDataToObject(formData)), ["/", "/admin/ads"]);
}

export async function deleteAdvertisementAction(id: number) {
  return run(() => m.deleteAdvertisement(id), ["/", "/admin/ads"]);
}

export async function updateSiteSettingAction(_: ActionState, formData: FormData) {
  return run(() => m.updateSiteSetting(formDataToObject(formData)), ["/", "/admin/settings"]);
}

function assertSuccess(state: ActionState) {
  if (!state.success) {
    const message =
      state.error ??
      Object.values(state.fieldErrors ?? {}).flat()[0] ??
      ACTION_FAILED_MESSAGE;
    throw new Error(message);
  }
}

export async function createCategoryForm(formData: FormData) {
  assertSuccess(await createCategoryAction({}, formData));
}

export async function deleteCategoryForm(id: number) {
  assertSuccess(await deleteCategoryAction(id));
}

export async function createToolForm(formData: FormData) {
  assertSuccess(await createToolAction({}, formData));
}

export async function deleteToolForm(id: number) {
  assertSuccess(await deleteToolAction(id));
}

export async function createAdvertisementForm(formData: FormData) {
  assertSuccess(await createAdvertisementAction({}, formData));
}

export async function deleteAdvertisementForm(id: number) {
  assertSuccess(await deleteAdvertisementAction(id));
}

export async function updateSiteSettingForm(formData: FormData) {
  assertSuccess(await updateSiteSettingAction({}, formData));
}

export async function updateCategoryForm(id: number, formData: FormData) {
  assertSuccess(await updateCategoryAction(id, {}, formData));
}

export async function updateToolForm(id: number, formData: FormData) {
  assertSuccess(await updateToolAction(id, {}, formData));
}

export async function updateAdvertisementForm(id: number, formData: FormData) {
  assertSuccess(await updateAdvertisementAction(id, {}, formData));
}
