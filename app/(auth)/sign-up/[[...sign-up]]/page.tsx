import { SignUp } from '@clerk/nextjs'
import React from 'react'

const page = () => {
  return (
    <div>
      <SignUp forceRedirectUrl={'/client'}/>
    </div>
  )
}

export default page
