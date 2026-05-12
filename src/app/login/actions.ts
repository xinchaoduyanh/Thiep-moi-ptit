"use server";

import { redirect } from "next/navigation";
import { setAdminSession } from "@/lib/admin-auth";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminUsername && adminPassword && username === adminUsername && password === adminPassword) {
    await setAdminSession();
    redirect("/");
  }

  redirect("/login?error=1");
}
