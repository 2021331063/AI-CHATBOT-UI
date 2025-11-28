import { Scissors, Upload } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const RemoveObject = () => {
  const [input, setInput] = useState(null)
  const [object, setObject] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [preview, setPreview] = useState(null)
  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (object.split(' ').length > 1) {
        return toast('Please enter only one object name')
      }

      const formData = new FormData()
      formData.append('image', input)
      formData.append('object', object)

      const { data } = await axios.post(
        'api/ai/remove-image-object',
        formData,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      )

      if (data.success) {
        setContent(data.content)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex flex-col lg:flex-row items-start gap-4 text-slate-700'>
      <form
        onSubmit={onSubmitHandler}
        className='w-full lg:w-1/2 p-4 bg-white rounded-lg boarder border-gray-200'
      >
        <div className='flex items-center gap-3'>
          <h1 className='text-xl font-semibold'>Object Removal</h1>
        </div>

        <p className='mt-6 text-sm font-medium'>Upload Image</p>

        <div className='mt-2 '>
          <label className='cursor-pointer flex items-center justify-center w-full px-4 py-2 text-sm text-black bg-[#e1e0ec] hover:bg-[#aea29f] rounded-md'>
         <Upload className='w-5 text-[#060321]' />
           <span className='ml-2 text-black font-semibold truncate'>{input ? input.name : 'Pick an image'}</span>
          <input
           type='file'
           accept='image/*'
            onChange={(e) => {
             const file = e.target.files[0]
            if (file) {
        setInput(file)
        setPreview(URL.createObjectURL(file))
                 }
              }}
              className='hidden' required/>
         </label>
          <p className='text-xs text-gray-500 mt-1'>
            {input ? input.name : 'No file chosen. Supported: JPG, PNG, etc.'}
          </p>

          {preview && (
            <div className='mt-3'>
              <p className='text-sm font-medium mb-1'>Preview:</p>
              <img
                src={preview}
                alt='Preview'
                className='w-full rounded-md border border-gray-300'
              />
            </div>
          )}
        </div>

        <p className='mt-3 text-sx font-medium'>
          Describe object name to remove
        </p>

        <textarea
          onChange={(e) => setObject(e.target.value)}
          value={object}
          rows={2}
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300'
          required
        />

        <button
          disabled={loading}
          className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#5341ca] to-[#01022a] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'
        >
          
          Remove Object
        </button>
      </form>

      <div className='w-full lg:w-1/2 p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96'>
        <div className='flex items-center gap-3'>
          
          <h1 className='text-xl font-semibold'>Processed Image</h1>
        </div>
        {!content ? (
          <div className='flex-1 flex justify-center items-center'>
            
          </div>
        ) : (
          <img src={content} alt='image' className='mt-3 w-full h-full' />
        )}
      </div>
    </div>
  )
}

export default RemoveObject