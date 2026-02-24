'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function fuseContests(contestIds: string[]) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')
    
    if (contestIds.length < 2) {
        throw new Error('É necessário pelo menos 2 editais para a fusão')
    }

    const userId = session.user.id

    // Busca os editais originais com suas matérias e tópicos
    const contests = await prisma.contest.findMany({
        where: { 
            id: { in: contestIds },
            userId 
        },
        include: {
            subjects: {
                include: {
                    topics: true
                }
            }
        }
    })

    if (contests.length !== contestIds.length) {
        throw new Error('Alguns concursos selecionados não foram encontrados ou não pertencem a você.')
    }

    const fusedName = `Super-Ciclo: ${contests.map(c => c.name.split(' ')[0]).join(' + ')}`
    
    // Inicia a transação da Fusão (Alquimia)
    const result = await prisma.$transaction(async (tx) => {
        // 1. Cria o Novo Concurso "Misto"
        const fusedContest = await tx.contest.create({
            data: {
                userId,
                name: fusedName,
                institution: 'Laboratório StudyHub',
                role: 'Edital Otimizado (Múltiplos)',
                isPrimary: true // O Super-ciclo vira o foco principal automaticamente
            }
        })

        // 2. Remove o status de isPrimary dos outros concursos do usuário
        await tx.contest.updateMany({
            where: { 
                userId, 
                id: { not: fusedContest.id },
                isPrimary: true 
            },
            data: { isPrimary: false }
        })

        // Mapas para evitar duplicação de Matérias e Tópicos com o MESMO NOME (Case Insensitive)
        const subjectMap = new Map<string, string>() // normalized_name -> Subject ID no novo concurso
        const topicMap = new Map<string, string>()   // normalized_name_within_subject -> Topic ID no novo concurso

        for (const contest of contests) {
            for (const subject of contest.subjects) {
                const normalizedSubjName = subject.name.trim().toLowerCase()
                
                let fusedSubjectId = subjectMap.get(normalizedSubjName)
                
                if (!fusedSubjectId) {
                    // Cria a matéria agregada
                    const newSubject = await tx.subject.create({
                        data: {
                            name: subject.name,
                            contestId: fusedContest.id
                        }
                    })
                    fusedSubjectId = newSubject.id
                    subjectMap.set(normalizedSubjName, fusedSubjectId)
                }

                // Agora mescla os tópicos dessa matéria
                for (const topic of subject.topics) {
                    const normalizedTopicName = `${normalizedSubjName}::${topic.name.trim().toLowerCase()}`
                    
                    if (!topicMap.has(normalizedTopicName)) {
                        const newTopic = await tx.topic.create({
                            data: {
                                name: topic.name,
                                subjectId: fusedSubjectId
                            }
                        })
                        topicMap.set(normalizedTopicName, newTopic.id)
                    }
                }
            }
        }

        return fusedContest
    })

    revalidatePath('/contests')
    revalidatePath('/dashboard')
    
    return result
}
