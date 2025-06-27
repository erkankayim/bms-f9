import { notFound } from "next/navigation"
import AccountForm from "../_components/account-form"
import { getAccountById } from "../_actions/server-actions"

interface Props {
  params: { id: string }
}

export default async function Page({ params }: Props) {
  const account = await getAccountById(Number(params.id)).catch(() => null)
  if (!account) notFound()

  return (
    <div className="container mx-auto py-10">
      <AccountForm initialData={account} accountId={account.id} />
    </div>
  )
}
