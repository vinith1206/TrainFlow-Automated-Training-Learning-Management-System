import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  // #region agent log
  fetch('http://127.0.0.1:7246/ingest/e4ab56a2-4aa2-4e5e-9da0-9a306e886fc3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:request-interceptor',message:'API request interceptor',data:{url:config.url,baseURL:config.baseURL,method:config.method},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  console.log('[DEBUG] API Request:', { url: config.url, baseURL: config.baseURL, method: config.method })
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => {
    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/e4ab56a2-4aa2-4e5e-9da0-9a306e886fc3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:response-success',message:'API response success',data:{url:response.config.url,status:response.status,hasData:!!response.data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    console.log('[DEBUG] API Response Success:', { url: response.config.url, status: response.status, hasData: !!response.data })
    return response
  },
  (error) => {
    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/e4ab56a2-4aa2-4e5e-9da0-9a306e886fc3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:response-error',message:'API response error',data:{url:error.config?.url,status:error.response?.status,message:error.message,responseData:error.response?.data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.error('[DEBUG] API Response Error:', { url: error.config?.url, status: error.response?.status, message: error.message, responseData: error.response?.data })
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

