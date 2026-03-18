'use client'
import { useEffect } from 'react'

export function DailyLoginTrigger() {
  useEffect(() => {
    fetch('/api/coopcoins/daily-login', { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        if (data.rewarded) {
          console.log(`CoopCoins: ganhou ${data.amount} CC pelo login diario!`)
        }
      })
      .catch(() => {})
  }, [])
  return null
}
