"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function InitDatabasePage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const initDatabase = async () => {
    try {
      setStatus("loading")
      setMessage("Initializing database...")

      const response = await fetch("/api/supabase/init-database")
      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage(data.message)
      } else {
        setStatus("error")
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setStatus("error")
      setMessage(`Exception: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Initialize Database</h1>

      <div className="mb-4">
        <Button onClick={initDatabase} disabled={status === "loading"}>
          {status === "loading" ? "Initializing..." : "Initialize Database"}
        </Button>
      </div>

      {status !== "idle" && (
        <Alert variant={status === "error" ? "destructive" : status === "success" ? "default" : "default"}>
          <AlertTitle>{status === "loading" ? "Loading" : status === "success" ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">What this does</h2>
        <p className="mb-4">
          This page initializes the Supabase database with the initial data for the guidelines application. It will
          create a record in the guidelines_data table with the ID 'main' containing the default guidelines data.
        </p>
        <p>If the database is already initialized, this operation will not overwrite existing data.</p>
      </div>
    </div>
  )
}
