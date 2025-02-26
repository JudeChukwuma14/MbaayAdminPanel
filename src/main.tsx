
import { createRoot } from 'react-dom/client'
import './index.css'
import store, { persistor } from './components/redux/store.ts'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { RouterProvider } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { mainRouter } from './router/mainRouter.tsx'
import { DarkModeProvider } from './components/context/DarkModeContext.tsx'


createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ToastContainer position='bottom-right' autoClose={5000}/>
      <DarkModeProvider>
      <RouterProvider router={mainRouter}/>
      </DarkModeProvider>
    </PersistGate>
  </Provider>,
)
