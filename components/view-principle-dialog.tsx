"use client"

import type React from "react"

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import type { Principle } from "@/types"

interface ViewPrincipleDialogProps {
  open: boolean
  onClose: () => void
  principle: Principle | null
}

const ViewPrincipleDialog: React.FC<ViewPrincipleDialogProps> = ({ open, onClose, principle }) => {
  if (!principle) {
    return null
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Prinzip anzeigen
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <div className="space-y-4">
          <div className="text-sm">
            <span className="font-medium">Name: </span>
            {principle.name}
          </div>
          <div className="text-sm">
            <span className="font-medium">Beschreibung: </span>
            {principle.description}
          </div>
          <div className="text-sm">
            <span className="font-medium">Kategorie: </span>
            {principle.category || "Keine"}
          </div>
          <div className="text-sm">
            <span className="font-medium">Elemente: </span>
            {principle.elements && principle.elements.length > 0 ? principle.elements.join(", ") : "Keins"}
          </div>
          <div className="text-sm">
            <span className="font-medium">Quelle: </span>
            {principle.source || "Keine"}
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Schließen</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ViewPrincipleDialog
