/**
 * Vordefinierte SVG-Vorlagen, die als Ausgangspunkt für neue Guidelines verwendet werden können
 */
export const svgTemplates = {
  // Einfacher Platzhalter
  placeholder: `<svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f0f0f0" />
    <text x="50%" y="50%" fontFamily="Arial" fontSize="24" fill="#666" textAnchor="middle">
      SVG Placeholder
    </text>
  </svg>`,

  // Einfaches UI-Element
  uiElement: `<svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#ffffff" />
    <rect x="20" y="20" width="160" height="40" rx="4" fill="#f3f4f6" stroke="#d1d5db" />
    <rect x="20" y="80" width="160" height="100" rx="4" fill="#f3f4f6" stroke="#d1d5db" />
    <rect x="100" y="150" width="80" height="30" rx="4" fill="#3b82f6" />
    <text x="140" y="170" fontFamily="Arial" fontSize="14" fill="white" textAnchor="middle">Button</text>
  </svg>`,

  // Formular
  form: `<svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#ffffff" />
    <text x="20" y="30" fontFamily="Arial" fontSize="14" fill="#374151">Name</text>
    <rect x="20" y="40" width="160" height="30" rx="4" fill="#f9fafb" stroke="#d1d5db" />
    <text x="20" y="100" fontFamily="Arial" fontSize="14" fill="#374151">Email</text>
    <rect x="20" y="110" width="160" height="30" rx="4" fill="#f9fafb" stroke="#d1d5db" />
    <rect x="20" y="160" width="80" height="30" rx="4" fill="#3b82f6" />
    <text x="60" y="180" fontFamily="Arial" fontSize="14" fill="white" textAnchor="middle">Submit</text>
  </svg>`,
}
