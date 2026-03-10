"use client";

import { useState } from "react";
import { updateTopic } from "@/features/topics/actions";
import { markTopicAsStudied } from "@/features/subjects/actions";
import { useToast } from "@/hooks/use-toast";

export function useTopicItem(
  nodeId: string,
  nodeName: string,
  initialStatus: "pending" | "studied" | "mastered",
) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(nodeName);
  const [isSaving, setIsSaving] = useState(false);
  const [optimisticStatus, setOptimisticStatus] = useState(initialStatus);
  const [isMarking, setIsMarking] = useState(false);

  async function handleMarkStudied() {
    if (optimisticStatus !== "pending" || isMarking) return;
    setOptimisticStatus("studied");
    setIsMarking(true);
    const result = await markTopicAsStudied(nodeId);
    if (!result.success) {
      setOptimisticStatus("pending");
      toast({ variant: "destructive", description: result.error });
    }
    setIsMarking(false);
  }

  async function handleAddSubTopic() {
    if (!newTopicName) return;
    setIsAddOpen(false);
    setNewTopicName("");
  }

  async function handleSaveEdit() {
    if (!editName.trim()) return;
    setIsSaving(true);
    const result = await updateTopic(nodeId, { name: editName.trim() });
    if (result.success) {
      setIsEditing(false);
    } else {
      toast({ variant: "destructive", description: result.error });
      setEditName(nodeName);
    }
    setIsSaving(false);
  }

  function handleCancelEdit() {
    setEditName(nodeName);
    setIsEditing(false);
  }

  return {
    isOpen,
    setIsOpen,
    isAddOpen,
    setIsAddOpen,
    newTopicName,
    setNewTopicName,
    handleAddSubTopic,
    isEditing,
    setIsEditing,
    editName,
    setEditName,
    isSaving,
    handleSaveEdit,
    handleCancelEdit,
    optimisticStatus,
    isMarking,
    handleMarkStudied,
  };
}
