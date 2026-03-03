"use client";

import { useState } from "react";

export function useTopicItem() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");

  async function handleAddSubTopic() {
    if (!newTopicName) return;
    setIsAddOpen(false);
    setNewTopicName("");
  }

  return {
    isOpen,
    setIsOpen,
    isAddOpen,
    setIsAddOpen,
    newTopicName,
    setNewTopicName,
    handleAddSubTopic,
  };
}
