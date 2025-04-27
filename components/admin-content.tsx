"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AdminContent() {
  const adminLinks = [
    {
      title: "Guidelines verwalten",
      description: "Guidelines hinzufügen, bearbeiten und löschen",
      href: "/",
    },
    {
      title: "Prinzipien verwalten",
      description: "Theoretische Prinzipien verwalten",
      href: "/",
      query: { showPrinciples: "true" },
    },
    {
      title: "Kategorien verwalten",
      description: "Kategorien hinzufügen, bearbeiten und löschen",
      href: "/admin/categories",
    },
    {
      title: "Kategorien mit SVG aktualisieren",
      description: "Allen Kategorien SVG-Icons aus Guidelines zuweisen",
      href: "/admin/add-categories-with-guideline-svg",
    },
    {
      title: "Daten importieren",
      description: "Neue Daten zu bestehenden hinzufügen",
      href: "/",
      query: { showImport: "true" },
    },
    {
      title: "Daten exportieren",
      description: "Daten als JSON-Datei herunterladen",
      href: "/",
      query: { showExport: "true" },
    },
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin-Bereich</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminLinks.map((link, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{link.title}</CardTitle>
              <CardDescription>{link.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href={
                  link.href +
                  (link.query
                    ? "?" +
                      Object.entries(link.query)
                        .map(([key, value]) => `${key}=${value}`)
                        .join("&")
                    : "")
                }
                className="inline-block w-full"
              >
                <Button className="w-full">Öffnen</Button>
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
