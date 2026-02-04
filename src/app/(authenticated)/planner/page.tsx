import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PlannerContent } from "@/features/study-cycle/components/PlannerContent"
import { getPlannerData } from "@/features/study-cycle/services/plannerService"

export const dynamic = 'force-dynamic'

export default async function PlannerPage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect("/login")
    }

    const plannerData = await getPlannerData()

    return <PlannerContent data={plannerData} />
}
