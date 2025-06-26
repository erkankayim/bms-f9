import { getAccountById } from "@/app/financials/chart-of-accounts/_actions/server-actions"

/**
 * Minimal helper so imports pass the build.
 * Extend/replace with proper typing & error-handling later.
 */
export async function getAccount(id: string | number) {
  return getAccountById(Number(id))
}
