import React, { createContext, Dispatch, SetStateAction, useState } from "react"

export const SelectedCategoryContext = createContext<{
  category: string
  setCategory: Dispatch<SetStateAction<string>> | null
}>({
  category: "",
  setCategory: null,
})

export default function SelectedCategoryProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [category, setCategory] = useState("")

  return (
    <SelectedCategoryContext.Provider value={{ category, setCategory }}>
      {children}
    </SelectedCategoryContext.Provider>
  )
}
