import { AppProvider } from "@/contexts/app-context"
import AddCategoriesWithGuidelineSvg from "@/components/add-categories-with-guideline-svg"

export default function Page() {
  return (
    <AppProvider>
      <AddCategoriesWithGuidelineSvg />
    </AppProvider>
  )
}
