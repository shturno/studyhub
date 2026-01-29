"use client"

import React from "react"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import type { ReactNode } from "react"

interface ExportButtonProps {
  children: ReactNode
}

export function ExportButton({ children }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const response = await fetch("/api/stats/export")

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `study-logs-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Exportação concluída!",
          description: "Seus dados de estudo foram exportados com sucesso.",
        })
      } else {
        toast({
          title: "Erro na exportação",
          description: "Não foi possível exportar os dados.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os dados.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div onClick={handleExport} style={{ pointerEvents: isExporting ? "none" : "auto" }}>
      {React.cloneElement(children as React.ReactElement, {
        disabled: isExporting,
        children: isExporting ? "Exportando..." : (children as React.ReactElement).props.children,
      })}
    </div>
  )
}
