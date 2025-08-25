import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AddItems from './components/AddItems'
import List from './components/List'
import Order from './components/Order'
import Navbar from './components/Navbar'


const App = () => {
  return (
    <>
    <Navbar />
    <Routes>
      <Route path='/' element={<AddItems />} />
      <Route path='/List' element={<List />} />
      <Route path='/orders' element={<Order />} />
    </Routes>
    </>
  )
}

export default App
