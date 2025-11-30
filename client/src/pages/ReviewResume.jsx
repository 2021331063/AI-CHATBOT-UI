
import { FileText, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import Markdown from 'react-markdown'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const ReviewResume = () => {
  const [input, setInput] = useState(null)
  const [preview, setPreview] = useState(null) // Added preview state
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('resume', input)

      const { data } = await axios.post(
        'api/ai/resume-review',
        formData,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
            'Content-Type': 'multipart/form-data',
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
    setInput(file)
    if (file) {
      setPreview(URL.createObjectURL(file))
    } else {
      setPreview(null)
    }
  }

  return (
    <div className="h-full overflow-y-scroll p-6 flex flex-col lg:flex-row items-start gap-4 text-slate-700">
      <form
        onSubmit={onSubmitHandler}
        className="w-full lg:w-1/2 p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3 space-y-6">
          <Sparkles className="w-6 text-[#0f95b6]" />
          <h1 className="text-xl font-semibold">File Review</h1>
        </div>

        <p className="mt-5 text-xl font-medium">Upload File</p>

        <div className="mt-2">
          <label className="mt-6 cursor-pointer flex items-center justify-center w-full px-4 py-2 text-sm text-black bg-[#ecf5f5] hover:bg-[#a1c7ca] rounded-md">
            <FileText className="w-5" />
             <span className="ml-2 truncate">
               {input ? input.name : 'Upload File'}
             </span>
             <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" required />
            </label>

          {/* PDF Preview */}
          {preview && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-1">Preview:</p>
              <iframe
                src={preview}
                title="File Preview"
                className="w-full h-64 border rounded-md"
              />
            </div>
          )}

          <p className="text-xs text-gray-500 mt-3">
            {input ? input.name : 'No file chosen. Supports PDF file only.'}
          </p>
        </div>

        <button
          type="submit"
          className="mt-18 w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#81c3e4] to-[#012e3b] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <FileText className="w-5" />
          )}
          Review File
        </button>
      </form>

      <div className="w-full lg:w-1/2 p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-[#1b83b7]" />
          <h1 className="text-xl font-semibold">Analysis Results</h1>
        </div>
        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            {!input ? (
              <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
                <FileText className="w-9 h-9 text-[#197682]" />
                <p>Upload a file and click "Review File" to get started</p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-3 h-full overflow-y-scroll text-sm text-slate-600">
            <div className="reset-tw">
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewResume
