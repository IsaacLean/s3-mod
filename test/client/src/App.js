import React from 'react'

import LocalUpload from './LocalUpload'
import S3Upload from './S3Upload'

function App() {
  return (
    <div>
      <LocalUpload />
      <S3Upload />
    </div>
  )
}

export default App
