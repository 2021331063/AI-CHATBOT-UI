import { Eraser, Sparkles, Upload } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@clerk/clerk-react'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const RemoveBackground = () => {
  const [input, setInput] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const { getToken } = useAuth()

  // cleanup object URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('image', input)

      const { data } = await axios.post(
        'api/ai/remove-image-background',
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

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (preview) {
        URL.revokeObjectURL(preview)
      }
      setInput(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex flex-col lg:flex-row items-start gap-4 text-slate-700'>
      <form
        onSubmit={onSubmitHandler}
        className='w-full lg:w-1/2 p-4 bg-white rounded-lg border border-gray-200 space-y-7'
      >
        <div className='flex items-center gap-3 space-y-6'>
          <Sparkles className='w-6 text-[#783412]' />
          <h1 className='text-xl font-semibold'>AI Background Removal</h1>
        </div>

        <p className='mt-6 text-xl font-medium'>Pick an Image</p>

        
        <div className='mt-2 '>
          <label className='cursor-pointer flex items-center justify-center w-full px-4 py-2 text-sm text-red-900 bg-[#ede5e2] hover:bg-[#8b7a75] rounded-md'>
           <Upload className='w-5' />
          <span className='ml-2 truncate font-semibold text-black'>
           {input ? input.name : 'Upload Image'}
         </span>
         <input type='file' accept='image/*'onChange={handleFileChange} className='hidden'required/>
           </label>

          <p className='mt-4 text-xs text-gray-500'>
            {input ? input.name : 'Supported: JPG, PNG and other Image formats.'}
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

        <button
          disabled={loading}
          className='mt-18 w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#e27231] to-[#351402] text-white px-4 py-2 text-sm rounded-lg cursor-pointer'
        >
          {loading ? (
            <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
          ) : (
            <Eraser className='w-5' />
          )}
          Remove Background
        </button>
      </form>

      <div className='w-full lg:w-1/2 p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96'>
        <div className='flex items-center gap-3'>
          <Eraser className='w-5 h-5 text-[#5e1c09]' />
          <h1 className='text-xl font-semibold'>Processed Image</h1>
        </div>
        {!content ? (
          <div className='flex-1 flex justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
             <Eraser className='w-9 h-9' />
             <p>Upload an image and click "Remove Background" to get the image without background</p>
            </div>
          </div>
        ) : (
          <img src={content} alt='image' className='mt-3 w-full h-full' />
        )}
      </div>
    </div>
  )
}

export default RemoveBackground