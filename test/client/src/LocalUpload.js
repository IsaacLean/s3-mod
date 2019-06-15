import React, { useState } from 'react'

import fetch from 'cross-fetch'

const LocalUpload = () => {
  const [file, setFile] = useState(null)

  const changeFile = e => {
    setFile(e.target.files[0])
  }

  const submit = e => {
    e.preventDefault()

    const formData = new FormData()
    formData.append('file', file)

    fetch(`/api/upload-local`, {
      method: 'PUT',
      body: formData
    })
      .then(res => {
        if (!res.ok) throw new Error('Upload failed')
        return res.text()
      })
      .catch(err => console.error(err))
  }

  return (
    <form onSubmit={submit}>
      <h1>Local Upload</h1>
      <p id="status">Please select a file...</p>
      <input type="file" name="foobar" onChange={changeFile} />
      <button type="submit">Submit</button>
    </form>
  )
}

export default LocalUpload
