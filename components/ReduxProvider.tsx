// store/Provider.tsx
'use client'

import { Provider } from 'react-redux'
import { store, persistor } from '@/store/store'
import { PersistGate } from 'redux-persist/integration/react'

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>
        <PersistGate  persistor={persistor}>
        {children}
        </PersistGate>    
      </Provider>
}