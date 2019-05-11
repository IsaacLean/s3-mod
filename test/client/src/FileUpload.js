import React, { useState } from 'react'

import fetch from 'cross-fetch'

const Form = () => {
  const [file, setFile] = useState(null)

  const changeFile = e => {
    setFile(e.target.files[0])
  }

  const submit = e => {
    e.preventDefault()

    return fetch(`/api/sign-s3?name=${file.name}&type=${file.type}`, { method: 'GET' })
      .then(res => {
        if (!res.ok) throw new Error('Get signed S3 request failed')

        return res.json()
      })
      .then(data => fetch(data.signedRequest, { method: 'PUT', body: file }).then(res => console.log(res)))
      .catch(err => console.error(err))
  }

  return (
    <form onSubmit={submit}>
      <p id="status">Please select a file...</p>
      <input type="file" onChange={changeFile} />
      <button type="submit">Submit</button>
    </form>
  )
}

export default Form
