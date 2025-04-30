import { MutedText } from "./ui/typography"

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 py-4 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <MutedText className="text-center sm:text-left mb-2 sm:mb-0">
            © {new Date().getFullYear()} CX Guidelines
          </MutedText>
          <div>
            <MutedText className="text-center sm:text-right">
              Impressum: Ergosign Switzerland AG, Friesenbergstrasse 75, 8630 Rüti
            </MutedText>
          </div>
        </div>
      </div>
    </footer>
  )
}
