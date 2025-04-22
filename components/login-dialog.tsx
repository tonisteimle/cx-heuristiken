"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { Lock, LogOut } from "lucide-react"

// Importiere die Typografie-Komponenten
import { DialogTitleText, DialogDescriptionText } from "@/components/ui/typography"

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()

  const handleLogin = () => {
    if (!password) return

    setIsLoading(true)
    try {
      const success = login(password)

      if (success) {
        toast({
          title: "Erfolgreich angemeldet",
          description: "Sie haben jetzt Bearbeitungsrechte.",
        })
        onOpenChange(false)
      } else {
        toast({
          title: "Anmeldung fehlgeschlagen",
          description: "Das eingegebene Passwort ist falsch.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setPassword("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitleText>Administrator-Anmeldung</DialogTitleText>
          <DialogDescriptionText>Geben Sie das Passwort ein, um Bearbeitungsrechte zu erhalten.</DialogDescriptionText>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort eingeben"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLogin()
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleLogin} disabled={!password || isLoading}>
            {isLoading ? "Anmeldung..." : "Anmelden"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function LoginButton() {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const { isAuthenticated, logout } = useAuth()

  return (
    <>
      {isAuthenticated ? (
        <Button variant="outline" size="sm" onClick={logout} className="flex items-center justify-center w-9 h-9 p-0">
          <LogOut size={16} />
          <span className="sr-only">Abmelden</span>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsLoginDialogOpen(true)}
          className="flex items-center gap-1"
        >
          <Lock size={14} />
          Anmelden
        </Button>
      )}
      <LoginDialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen} />
    </>
  )
}
