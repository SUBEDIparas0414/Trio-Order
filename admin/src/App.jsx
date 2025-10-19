import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AddItems from './components/AddItems'
import List from './components/List'
import Order from './components/Order'
import Navbar from './components/Navbar'
import AdminLogin from './components/AdminLogin'
import AdminSignup from './components/AdminSignup'
import AdminPrivateRoute from './components/AdminPrivateRoute'


const App = () => {
  return (
    <>
    <Routes>
      <Route path='/admin-login' element={<AdminLogin />} />
      <Route path='/admin-signup' element={<AdminSignup />} />
      <Route path='/' element={
        <AdminPrivateRoute>
          <Navbar />
          <AddItems />
        </AdminPrivateRoute>
      } />
      <Route path='/list' element={
        <AdminPrivateRoute>
          <Navbar />
          <List />
        </AdminPrivateRoute>
      } />
      <Route path='/orders' element={
        <AdminPrivateRoute>
          <Navbar />
          <Order />
        </AdminPrivateRoute>
      } />
    </Routes>
    </>
  )
}

export default App
