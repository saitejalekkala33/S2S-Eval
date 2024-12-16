import { SignIn } from '@clerk/nextjs'
import React from 'react'


const page = () => {
  return (
    <div>
      <SignIn forceRedirectUrl={'/'}/>
    </div>
  )
}

export default page
