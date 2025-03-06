import { createContext, useContext, useState, ReactNode } from 'react'

type Language = 'en' | 'pt'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    title: 'Request Inspector',
    subtitle: 'Use this tool to inspect incoming requests from your applications. Copy the example code below and use it in your application to start sending requests.',
    ngrokUrl: 'Your Ngrok URL',
    ngrokPlaceholder: 'Enter your ngrok URL',
    exampleCode: 'Example Code',
    copyCode: 'Copy code',
    incomingRequests: 'Incoming Requests',
    clearAll: 'Clear All',
    noRequests: 'No requests received yet. Use the example code above to send requests.',
    codeCopied: 'Code copied!',
    requestsCleared: 'Requests cleared',
    requestReceived: 'Request received',
    serverRunning: 'Server running on port',
    clientConnected: 'Client connected',
  },
  pt: {
    title: 'Inspetor de Requisições',
    subtitle: 'Use esta ferramenta para inspecionar requisições recebidas de suas aplicações. Copie o código de exemplo abaixo e use-o em sua aplicação para começar a enviar requisições.',
    ngrokUrl: 'Sua URL do Ngrok',
    ngrokPlaceholder: 'Digite sua URL do ngrok',
    exampleCode: 'Código de Exemplo',
    copyCode: 'Copiar código',
    incomingRequests: 'Requisições Recebidas',
    clearAll: 'Limpar Tudo',
    noRequests: 'Nenhuma requisição recebida ainda. Use o código de exemplo acima para enviar requisições.',
    codeCopied: 'Código copiado!',
    requestsCleared: 'Requisições limpas',
    requestReceived: 'Requisição recebida',
    serverRunning: 'Servidor rodando na porta',
    clientConnected: 'Cliente conectado',
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en')

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
} 