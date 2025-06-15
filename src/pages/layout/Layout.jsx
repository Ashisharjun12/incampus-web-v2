import React from 'react'
import { Outlet } from 'react-router-dom'
import Navigation from '../home/Navigation'


const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 md:px-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout