import { getContests } from '../actions'
import { ContestCard } from './ContestCard'
import { CreateContestDialog } from './CreateContestDialog'

export async function ContestList() {
    const contests = await getContests()

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Meus Concursos</h2>
                    <p className="text-zinc-400">Gerencie seus editais e metas.</p>
                </div>
                <CreateContestDialog />
            </div>

            {contests.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-white/10 bg-white/5">
                    <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                        <span className="text-2xl">🎯</span>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Nenhum concurso encontrado</h3>
                    <p className="text-zinc-400 text-center max-w-sm mb-6">
                        Adicione seu primeiro edital para começar a organizar seus estudos.
                    </p>
                    <CreateContestDialog />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contests.map((contest) => (
                        <ContestCard key={contest.id} contest={contest} />
                    ))}
                </div>
            )}
        </div>
    )
}
