import React from 'react'

import FFUHUpload from './FFUHUpload'
import LocalUpload from './LocalUpload'
import S3Upload from './S3Upload'

function App() {
  return (
    <div>
      <LocalUpload />
      <S3Upload />
      <FFUHUpload />
    </div>
  )
}

export default App
