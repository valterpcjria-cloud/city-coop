'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Question {
  id: string
  type: 'multiple_choice' | 'true_false'
  question: string
  options?: string[]
  correct: string
  order_num: number
}

interface Quiz {
  id: string
  title: string
  timer_seconds: number
}

export function QuizPlayer({ quiz, questions }: { quiz: Quiz; questions: Question[] }) {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [timeLeft, setTimeLeft] = useState(quiz.timer_seconds)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [startTime] = useState(Date.now())
  const [shake, setShake] = useState(false)
  const [celebrate, setCelebrate] = useState(false)

  const question = questions[current]
  const progress = ((current) / questions.length) * 100

  const handleNext = useCallback(() => {
    setSelected(null)
    setFeedback(null)
    setTimeLeft(quiz.timer_seconds)
    if (current + 1 >= questions.length) {
      submitQuiz()
    } else {
      setCurrent(c => c + 1)
    }
  }, [current, questions.length])

  const submitQuiz = async () => {
    const timeTaken = Math.round((Date.now() - startTime) / 1000)
    const res = await fetch(`/api/quizzes/${quiz.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, timeTaken })
    })
    const data = await res.json()
    setResult(data)
    setFinished(true)
    if (data.perfect) setCelebrate(true)
  }

  const handleAnswer = (answer: string) => {
    if (selected) return
    setSelected(answer)
    const isCorrect = answer === question.correct
    setAnswers(prev => ({ ...prev, [question.id]: answer }))

    if (isCorrect) {
      setFeedback('correct')
      setScore(s => s + 1)
      setCelebrate(true)
      setTimeout(() => setCelebrate(false), 1000)
    } else {
      setFeedback('wrong')
      setShake(true)
      setTimeout(() => setShake(false), 600)
    }
    setTimeout(handleNext, 1500)
  }

  useEffect(() => {
    if (selected || finished) return
    if (timeLeft <= 0) {
      handleAnswer('')
      return
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft, selected, finished])

  if (finished && result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">{result.perfect ? '🏆' : result.score >= 70 ? '🎉' : '💪'}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Concluído!</h2>
          <p className="text-gray-500 mb-6">Você acertou {result.acertos} de {result.total} questões</p>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-5 text-white mb-6">
            <p className="text-5xl font-bold">{result.score}%</p>
            <div className="flex justify-center gap-1 mt-2">
              {[1,2,3,4,5].map(s => (
                <span key={s} className={`text-2xl ${result.score >= s * 20 ? 'opacity-100' : 'opacity-30'}`}>⭐</span>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
            <p className="text-amber-800 font-bold text-xl">🪙 +{result.coopcoins} CC</p>
            <p className="text-amber-600 text-sm mt-1">adicionados à carteira da escola!</p>
            {result.perfect && <p className="text-amber-700 text-xs mt-1 font-medium">🎯 Bônus de +5 CC por 100% de acertos!</p>}
          </div>

          <button
            onClick={() => router.push('/estudante/quizzes')}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors"
          >
            Ver todos os quizzes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 flex items-center justify-center">
      <div className={`bg-white rounded-3xl shadow-xl p-6 max-w-lg w-full ${shake ? 'animate-bounce' : ''}`}>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-gray-500">⚡ {quiz.title}</span>
          <span className="text-sm font-bold text-gray-500">{current + 1}/{questions.length}</span>
        </div>

        {/* Barra de progresso */}
        <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Timer */}
        <div className="flex justify-center mb-5">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold border-4 transition-colors ${
            timeLeft <= 5 ? 'border-red-400 text-red-500 bg-red-50' :
            timeLeft <= 10 ? 'border-amber-400 text-amber-500 bg-amber-50' :
            'border-blue-400 text-blue-600 bg-blue-50'
          }`}>
            {timeLeft}
          </div>
        </div>

        {/* Questão */}
        <div className={`rounded-2xl p-5 mb-5 text-center transition-all ${
          feedback === 'correct' ? 'bg-green-50 border-2 border-green-300' :
          feedback === 'wrong' ? 'bg-red-50 border-2 border-red-300' :
          'bg-gray-50'
        }`}>
          <p className="text-lg font-semibold text-gray-800">{question.question}</p>
          {feedback && (
            <p className={`mt-2 font-bold text-lg ${feedback === 'correct' ? 'text-green-600' : 'text-red-500'}`}>
              {feedback === 'correct' ? '✅ Correto!' : `❌ A resposta era: ${question.correct}`}
            </p>
          )}
        </div>

        {/* Opções */}
        <div className="grid gap-3">
          {question.type === 'true_false' ? (
            <>
              {['true', 'false'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  disabled={!!selected}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                    selected === opt
                      ? opt === question.correct
                        ? 'bg-green-500 text-white scale-105'
                        : 'bg-red-400 text-white'
                      : selected && opt === question.correct
                        ? 'bg-green-200 text-green-800'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:scale-102 border-2 border-blue-200'
                  }`}
                >
                  {opt === 'true' ? '✅ Verdadeiro' : '❌ Falso'}
                </button>
              ))}
            </>
          ) : (
            <>
              {question.options?.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  disabled={!!selected}
                  className={`w-full py-3 px-4 rounded-2xl font-medium text-left transition-all flex items-center gap-3 ${
                    selected === opt
                      ? opt === question.correct
                        ? 'bg-green-500 text-white scale-105'
                        : 'bg-red-400 text-white'
                      : selected && opt === question.correct
                        ? 'bg-green-200 text-green-800'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-2 border-blue-200'
                  }`}
                >
                  <span className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {['A','B','C','D'][i]}
                  </span>
                  {opt}
                </button>
              ))}
            </>
          )}
        </div>

        {/* CC info */}
        <p className="text-center text-xs text-gray-400 mt-4">🪙 +20 CC para sua escola ao finalizar!</p>
      </div>
    </div>
  )
}
