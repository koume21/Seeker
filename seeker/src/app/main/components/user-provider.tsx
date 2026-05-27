"use client";

import {createContext,useContext} from "react"



interface LanguageOption {
  id:number;
  name: string;
}

interface MainContextType {
  userId: string;
  languages: LanguageOption[];
}

const MainContext = createContext<MainContextType | undefined>(undefined);

export function MainProvider({ 
  userId, 
  languages, 
  children 
}: { 
  userId: string; 
  languages: LanguageOption[]; 
  children: React.ReactNode 
}) {
  return (
    <MainContext.Provider value={{ userId, languages }}>
      {children}
    </MainContext.Provider>
  );
}

export function useMainData() {
  const context = useContext(MainContext);
  if (!context) {
    throw new Error("useMainData must be used within a MainProvider");
  }
  return context;
}