"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CreateEditorialDialog } from "./CreateEditorialDialog";
import { EditorialList } from "./EditorialList";
import { ContentMapper } from "./ContentMapper";
import { ContentCrossingView } from "./ContentCrossingView";
import type { EditorialWithMappings } from "../types";
import type { Subject, Topic } from "@prisma/client";

interface EditorialsViewProps {
  contestId: string;
  editorials: EditorialWithMappings[];
  subjects: (Subject & { topics: Topic[] })[];
}

export function EditorialsView({
  contestId,
  editorials,
  subjects,
}: EditorialsViewProps) {
  const [selectedEditorial, setSelectedEditorial] =
    useState<EditorialWithMappings | null>(null);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="editorials" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editorials">
            Editais ({editorials.length})
          </TabsTrigger>
          <TabsTrigger value="crossings">Cruzamentos</TabsTrigger>
          <TabsTrigger value="mapper">Mapear Conteúdo</TabsTrigger>
        </TabsList>

        <TabsContent value="editorials" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Meus Editais</h3>
              <p className="text-sm text-zinc-400">
                Gerencie e mapeie o conteúdo dos seus editais para seus tópicos
                de estudo
              </p>
            </div>
            <CreateEditorialDialog contestId={contestId} />
          </div>
          <EditorialList
            editorials={editorials}
            onSelectEdito={setSelectedEditorial}
          />
        </TabsContent>

        <TabsContent value="crossings" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Cruzamentos de Conteúdo
            </h3>
            <p className="text-sm text-zinc-400">
              Identifique os tópicos que aparecem em múltiplos editais
            </p>
          </div>
          <ContentCrossingView
            contestId={contestId}
            editorialCount={editorials.length}
          />
        </TabsContent>

        <TabsContent value="mapper" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Mapear Conteúdo
            </h3>
            <p className="text-sm text-zinc-400">
              Selecione um edital e mapeie seu conteúdo para seus tópicos de
              estudo
            </p>
          </div>

          {selectedEditorial ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-indigo-600/20 border border-indigo-500/50">
                <p className="text-sm text-indigo-200">
                  Mapeando:{" "}
                  <span className="font-semibold">
                    {selectedEditorial.title}
                  </span>
                </p>
              </div>
              <ContentMapper
                editorialId={selectedEditorial.id}
                subjects={subjects}
                onClose={() => setSelectedEditorial(null)}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-zinc-400 mb-4">
                Selecione um edital para começar a mapear seu conteúdo
              </p>
              <EditorialList
                editorials={editorials}
                onSelectEdito={setSelectedEditorial}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
