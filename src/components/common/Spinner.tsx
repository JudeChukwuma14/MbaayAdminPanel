import React from 'react'
import { PropagateLoader } from 'react-spinners'

const Spinner:React.FC = () => {
  return (
    <div className='flex justify-center items-center min-h-screen'>
        <PropagateLoader  color='#ff710b'/>
    </div>
  )
}

export default Spinner