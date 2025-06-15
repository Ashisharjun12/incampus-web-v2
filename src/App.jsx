import React from 'react'
import { Button } from './components/ui/button'
import { ModeToggle } from './components/ui/mode-toggle'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/home/Home'
import Layout from './pages/layout/Layout'

const App = () => {
  return (
    <>
     <Routes>
          <Route path='/' element={<Layout />}>
            <Route index element={<Home />} />
          </Route>
        </Routes>
    </>
  )
}

export default App