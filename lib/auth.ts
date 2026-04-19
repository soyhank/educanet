import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { userConRelacionesInclude, type UserConRelaciones } from "@/types/database";
import type { RolUsuario, User } from "@prisma/client";

/**
 * Returns the current Supabase session or null.
 */
export async function getSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Returns the current authenticated user with puesto and area, or null.
 * Reads from Supabase Auth then enriches with Prisma data.
 *
 * Envuelto en React.cache() para deduplicar por request: layout,
 * page y sidebar consultan el user una sola vez (antes eran 3 DB hits).
 */
export const getCurrentUser = cache(
  async (): Promise<UserConRelaciones | null> => {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) return null;

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: userConRelacionesInclude,
    });

    if (!user) {
      console.warn(
        `[auth] Supabase user ${authUser.id} exists but no matching User record in Prisma`
      );
      return null;
    }

    return user;
  }
);

/**
 * Requires authentication. Redirects to /login if not authenticated.
 */
export async function requireAuth(): Promise<UserConRelaciones> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Requires one of the specified roles. Redirects to /unauthorized if
 * the user's role doesn't match.
 */
export async function requireRole(
  roles: RolUsuario[]
): Promise<UserConRelaciones> {
  const user = await requireAuth();
  if (!roles.includes(user.rol)) redirect("/unauthorized");
  return user;
}

/**
 * Role check helpers.
 */
export function isAdmin(user: Pick<User, "rol">): boolean {
  return user.rol === "ADMIN";
}

export function isRRHH(user: Pick<User, "rol">): boolean {
  return user.rol === "RRHH";
}

export function esAdministrativo(user: Pick<User, "rol">): boolean {
  return user.rol === "ADMIN" || user.rol === "RRHH";
}
