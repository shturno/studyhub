import { getContests } from '../actions'
import { ContestCard } from './ContestCard'
import { CreateContestDialog } from './CreateContestDialog'

export async function ContestList() {
    const contests = await getContests()

    return (
        <div className="space-y-6">
            {/* List header */}
            <div className="flex items-center justify-between">
                <div className="font-pixel text-[7px] text-[#7f7f9f]">
                    {contests.length} EDITAL{contests.length === 1 ? '' : 'S'} ENCONTRADO{contests.length === 1 ? '' : 'S'}
                </div>
                <CreateContestDialog />
            </div>

            {contests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {contests.map((contest) => (
                        <ContestCard key={contest.id} contest={contest} />
                    ))}
                </div>
            ) : (
                <div className="py-16 flex flex-col items-center justify-center text-center"
                    style={{ border: '2px dashed rgba(0,255,65,0.2)', background: '#04000a' }}>
                    <span className="text-4xl mb-4">🎯</span>
                    <div className="font-pixel text-[8px] text-[#555] mb-2">
                        NENHUM CONCURSO ENCONTRADO
                    </div>
                    <div className="font-mono text-base text-[#444] mb-6">
                        Adicione seu primeiro edital para organizar seus estudos.
                    </div>
                    <CreateContestDialog />
                </div>
            )}
        </div>
    )
}
