import { redirect } from "next/navigation";
import { AdminDashboard } from "./AdminDashboard";
import { createInviteAction, deleteInviteAction, logoutAction, updateInviteAction } from "./admin-actions";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { listInvitesWithMessages } from "@/lib/invitations";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (!(await isAdminLoggedIn())) {
    redirect("/login");
  }

  const invites = await listInvitesWithMessages();

  return (
    <AdminDashboard
      createAction={createInviteAction}
      deleteAction={deleteInviteAction}
      invites={invites}
      logoutAction={logoutAction}
      updateAction={updateInviteAction}
    />
  );
}
