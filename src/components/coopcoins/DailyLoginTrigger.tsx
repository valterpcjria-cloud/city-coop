'use client'
import { useEffect } from 'react'

export function DailyLoginTrigger() {
  useEffect(() => {
    const today = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    const key = `coopcoins_daily_${today}`

    if (localStorage.getItem(key)) return

    localStorage.setItem(key, 'true')

    fetch('/api/coopcoins/daily-login', { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        if (data.rewarded) {
          console.log(`CoopCoins: ganhou ${data.amount} CC!`)
        }
      })
      .catch(() => {
        localStorage.removeItem(key)
      })
  }, [])
  return null
}