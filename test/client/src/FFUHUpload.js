import React, { useState } from 'react'

import fetch from 'cross-fetch'

const FFUHUpload = () => {
  const [file, setFile] = useState(null)

  const changeFile = e => {
    setFile(e.target.files[0])
  }

  const submit = e => {
    e.preventDefault()

    fetch(`/api/upload-ffuh?name=${file.name}`, { method: 'GET' })
      .then(res => {
        if (!res.ok) throw new Error('Get upload endpoint failed')
        return res.json()
      })
      .then(data => {
        const uploadTest = data.upload.split('/')

        if (uploadTest[2] === 'localhost:3000') {
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
        } else {
          fetch(`/api/sign-s3?name=${file.name}&type=${file.type}`, { method: 'GET' })
            .then(res => {
              if (!res.ok) throw new Error('Get S3 signed request failed')
              return res.json()
            })
            .then(data => fetch(data.upload, { method: 'PUT', body: file }))
            .catch(err => console.error(err))
        }
      })
      .catch(err => console.error(err))
  }

  return (
    <form onSubmit={submit}>
      <h1>FFUH Upload</h1>
      <p id="status">Please select a file...</p>
      <input type="file" name="sampleFile" onChange={changeFile} />
      <button type="submit">Submit</button>
    </form>
  )
}

export default FFUHUpload
