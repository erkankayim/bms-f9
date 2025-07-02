import { notFound } from "next/navigation"
import { AccountForm } from "../../_components/account-form"
import { getAccountById } from "../../_actions/server-actions"

interface Props {
  params: { id: string }
}

export default async function EditAccountPage({ params }: Props) {
  try {
    const account = await getAccountById(params.id)

    if (!account) {
      notFound()
    }

    return (
      <div className="container mx-auto py-10">
        <AccountForm account={account} isEdit={true} />
      </div>
    )
  } catch (error) {
    console.error("Error loading account:", error)
    notFound()
  }
}
