"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { mapContentAction } from "../actions";
import type { Topic, Subject } from "@prisma/client";

interface ContentMapperProps {
  editorialId: string;
  subjects: (Subject & { topics: Topic[] })[];
  onClose?: () => void;
}

interface TopicSelection {
  topicId: string;
  topicName: string;
  subjectName: string;
  contentSummary: string;
  relevance: number;
}

export function ContentMapper({
  editorialId,
  subjects,
  onClose,
}: ContentMapperProps) {
  const router = useRouter();
  const [selectedTopics, setSelectedTopics] = useState<TopicSelection[]>([]);
  const [loading, setLoading] = useState(false);

  function toggleTopic(
    topicId: string,
    topicName: string,
    subjectName: string,
  ) {
    setSelectedTopics((prev) => {
      const exists = prev.find((t) => t.topicId === topicId);
      if (exists) {
        return prev.filter((t) => t.topicId !== topicId);
      }
      return [
        ...prev,
        {
          topicId,
          topicName,
          subjectName,
          contentSummary: "",
          relevance: 50,
        },
      ];
    });
  }

  function updateTopic(topicId: string, updates: Partial<TopicSelection>) {
    setSelectedTopics((prev) =>
      prev.map((t) => (t.topicId === topicId ? { ...t, ...updates } : t)),
    );
  }

  async function handleSave() {
    if (selectedTopics.length === 0) {
      toast.error("Selecione pelo menos um tópico");
      return;
    }

    setLoading(true);
    try {
      await mapContentAction(
        editorialId,
        selectedTopics.map((t) => ({
          topicId: t.topicId,
          contentSummary: t.contentSummary,
          relevance: t.relevance,
        })),
      );
      toast.success(`${selectedTopics.length} tópicos mapeados com sucesso!`);
      setSelectedTopics([]);
      onClose?.();
      router.refresh();
    } catch (error) {
      toast.error("Erro ao mapear conteúdo");
          } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {subjects.map((subject) => (
          <div key={subject.id} className="space-y-2">
            <h4 className="font-semibold text-zinc-200">{subject.name}</h4>
            <div className="grid grid-cols-1 gap-2 pl-4 border-l border-zinc-700">
              {subject.topics.map((topic) => {
                const isSelected = selectedTopics.some(
                  (t) => t.topicId === topic.id,
                );
                const selected = selectedTopics.find(
                  (t) => t.topicId === topic.id,
                );

                return (
                  <div
                    key={topic.id}
                    className={`space-y-2 p-3 rounded-lg transition-colors ${
                      isSelected
                        ? "bg-indigo-600/20 border border-indigo-500/50"
                        : "bg-background/50 border border-zinc-700/50 hover:border-zinc-600"
                    }`}
                  >
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() =>
                          toggleTopic(topic.id, topic.name, subject.name)
                        }
                      />
                      <span className="text-sm font-medium text-zinc-200">
                        {topic.name}
                      </span>
                    </label>

                    {isSelected && selected && (
                      <div className="space-y-3 mt-3 pt-3 border-t border-zinc-700">
                        <div>
                          <label className="text-xs text-zinc-400 block mb-2">
                            Resumo do conteúdo neste tópico
                          </label>
                          <Textarea
                            placeholder="Descreva brevemente qual parte do edital refere-se a este tópico..."
                            value={selected.contentSummary}
                            onChange={(e) =>
                              updateTopic(topic.id, {
                                contentSummary: e.target.value,
                              })
                            }
                            className="text-xs h-16 resize-none"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs text-zinc-400">
                              Relevância para este tópico
                            </label>
                            <span className="text-xs font-semibold text-indigo-400">
                              {selected.relevance}%
                            </span>
                          </div>
                          <Slider
                            value={[selected.relevance]}
                            onValueChange={([value]) =>
                              updateTopic(topic.id, { relevance: value })
                            }
                            min={0}
                            max={100}
                            step={5}
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedTopics.length > 0 && (
        <Card className="p-4 bg-indigo-600/20 border-indigo-500/50">
          <p className="text-sm text-indigo-200 mb-4">
            {selectedTopics.length} tópico
            {selectedTopics.length !== 1 ? "s" : ""} selecionado
            {selectedTopics.length !== 1 ? "s" : ""}
          </p>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Salvar Mapeamentos
              </>
            )}
          </Button>
        </Card>
      )}
    </div>
  );
}
