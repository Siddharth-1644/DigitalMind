import React, { useState, useRef } from 'react'
import Layout from './components/Layout'
import InputProfile from './components/InputProfile'
import RadarAnalysis from './components/RadarAnalysis'
import SemPathway from './components/SemPathway'
import ClusterMap from './components/ClusterMap'
import RiskSynthesis from './components/RiskSynthesis'

function App() {
  const [result, setResult] = useState(null)
  const [formValues, setFormValues] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const resultsRef = useRef(null)

  async function handlePredict(formData) {
    setLoading(true)
    setError(null)
    setFormValues(formData)
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const res = await fetch(`${API}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const err = await res.json()
        const detail = err.detail
        const msg = Array.isArray(detail)
          ? detail.map(d => d.msg || JSON.stringify(d)).join('; ')
          : (detail || 'Prediction failed')
        throw new Error(msg)
      }
      const data = await res.json()
      setResult(data)
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <InputProfile onPredict={handlePredict} loading={loading} error={error} />
      <div ref={resultsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <RadarAnalysis result={result} formValues={formValues} />
        <SemPathway result={result} />
      </div>
      <ClusterMap result={result} />
      <RiskSynthesis result={result} />

    </Layout>
  )
}

export default App
