'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Question {
  type: 'multiple_choice' | 'true_false'
  question: string
  options?: string[]
  correct: string
}

export default function NovoQuizPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [timerSeconds, setTimerSeconds] = useState(30)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiTema, setAiTema] = useState('')
  const [aiNumQuestoes, setAiNumQuestoes] = useState(5)
  const [showAiPanel, setShowAiPanel] = useState(false)
  const [classId, setClassId] = useState('')

  const addQuestion = (type: 'multiple_choice' | 'true_false') => {
    if (type === 'true_false') {
      setQuestions(prev => [...prev, { type, question: '', correct: 'true' }])
    } else {
      setQuestions(prev => [...prev, { type, question: '', options: ['', '', '', ''], correct: '' }])
    }
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q))
  }

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q
      const options = [...(q.options || [])]
      options[optIndex] = value
      return { ...q, options }
    }))
  }

  const removeQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index))
  }

  const generateWithAI = async () => {
    if (!aiTema) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/quizzes/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema: aiTema, numQuestoes: aiNumQuestoes })
      })
      const data = await res.json()
      if (data.quiz) {
        setTitle(data.quiz.title)
        setDescription(data.quiz.description)
        setQuestions(data.quiz.questions)
        setShowAiPanel(false)
      }
    } catch (e) {
      alert('Erro ao gerar quiz com IA')
    }
    setAiLoading(false)
  }

  const handleSubmit = async () => {
    if (!title || questions.length === 0) {
      alert('Adicione um título e pelo menos uma questão!')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, class_id: classId, questions, timer_seconds: timerSeconds })
      })
      const data = await res.json()
      if (data.success) {
        router.push('/professor/quizzes')
      }
    } catch (e) {
      alert('Erro ao criar quiz')
    }
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">←</button>
        <h1 className="text-3xl font-bold text-gray-800">⚡ Criar Quiz</h1>
      </div>

      {/* Botao IA */}
      <button
        onClick={() => setShowAiPanel(!showAiPanel)}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl font-bold text-lg mb-6 hover:opacity-90 transition-opacity flex items-center justify-center gap-3"
      >
        🤖 Gerar Quiz com IA (DOT Assistente)
      </button>

      {/* Painel IA */}
      {showAiPanel && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5 mb-6">
          <h3 className="font-bold text-purple-800 mb-4">🤖 Gerar Quiz Automaticamente</h3>
          <input
            type="text"
            placeholder="Ex: Principios do cooperativismo, Historia das cooperativas..."
            value={aiTema}
            onChange={e => setAiTema(e.target.value)}
            className="w-full border-2 border-purple-200 rounded-xl p-3 mb-3 focus:outline-none focus:border-purple-400"
          />
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-medium text-purple-700">Numero de questoes:</label>
            {[3, 5, 8, 10].map(n => (
              <button key={n} onClick={() => setAiNumQuestoes(n)}
                className={`px-3 py-1.5 rounded-lg font-bold text-sm transition-colors ${aiNumQuestoes === n ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 border border-purple-300'}`}>
                {n}
              </button>
            ))}
          </div>
          <button onClick={generateWithAI} disabled={aiLoading || !aiTema}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:opacity-50">
            {aiLoading ? '🤖 Gerando...' : '✨ Gerar agora!'}
          </button>
        </div>
      )}

      {/* Dados basicos */}
      <div className="bg-white rounded-2xl border p-5 mb-5">
        <h3 className="font-bold text-gray-700 mb-4">📋 Dados do Quiz</h3>
        <input type="text" placeholder="Titulo do quiz" value={title} onChange={e => setTitle(e.target.value)}
          className="w-full border-2 border-gray-200 rounded-xl p-3 mb-3 focus:outline-none focus:border-blue-400 font-medium" />
        <textarea placeholder="Descricao (opcional)" value={description} onChange={e => setDescription(e.target.value)}
          className="w-full border-2 border-gray-200 rounded-xl p-3 mb-3 focus:outline-none focus:border-blue-400 h-20 resize-none" />
        <input type="text" placeholder="ID da turma (class_id)" value={classId} onChange={e => setClassId(e.target.value)}
          className="w-full border-2 border-gray-200 rounded-xl p-3 mb-3 focus:outline-none focus:border-blue-400" />
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600">Timer por questao:</label>
          {[10, 20, 30, 60].map(t => (
            <button key={t} onClick={() => setTimerSeconds(t)}
              className={`px-3 py-1.5 rounded-lg font-bold text-sm transition-colors ${timerSeconds === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t}s
            </button>
          ))}
        </div>
      </div>

      {/* Questoes */}
      <div className="mb-5">
        <h3 className="font-bold text-gray-700 mb-4">❓ Questoes ({questions.length})</h3>
        {questions.map((q, qi) => (
          <div key={qi} className="bg-white rounded-2xl border-2 border-gray-100 p-5 mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-blue-600">Questao {qi + 1} — {q.type === 'true_false' ? 'V/F' : 'Multipla escolha'}</span>
              <button onClick={() => removeQuestion(qi)} className="text-red-400 hover:text-red-600 text-sm">Remover</button>
            </div>
            <textarea
              placeholder="Digite a questao..."
              value={q.question}
              onChange={e => updateQuestion(qi, 'question', e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl p-3 mb-3 resize-none h-20 focus:outline-none focus:border-blue-400"
            />
            {q.type === 'true_false' ? (
              <div className="flex gap-3">
                {['true', 'false'].map(opt => (
                  <button key={opt} onClick={() => updateQuestion(qi, 'correct', opt)}
                    className={`flex-1 py-2 rounded-xl font-bold transition-colors ${q.correct === opt ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {opt === 'true' ? '✅ Verdadeiro' : '❌ Falso'}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid gap-2">
                {q.options?.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <button onClick={() => updateQuestion(qi, 'correct', opt)}
                      className={`w-8 h-8 rounded-full font-bold text-sm flex-shrink-0 transition-colors ${q.correct === opt ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {['A','B','C','D'][oi]}
                    </button>
                    <input type="text" placeholder={`Opcao ${['A','B','C','D'][oi]}`} value={opt}
                      onChange={e => updateOption(qi, oi, e.target.value)}
                      className="flex-1 border-2 border-gray-200 rounded-xl p-2 focus:outline-none focus:border-blue-400" />
                  </div>
                ))}
                <p className="text-xs text-gray-400 mt-1">Clique na letra para marcar a resposta correta</p>
              </div>
            )}
          </div>
        ))}

        <div className="flex gap-3">
          <button onClick={() => addQuestion('multiple_choice')}
            className="flex-1 py-3 border-2 border-dashed border-blue-300 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors">
            + Multipla Escolha
          </button>
          <button onClick={() => addQuestion('true_false')}
            className="flex-1 py-3 border-2 border-dashed border-purple-300 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-colors">
            + Verdadeiro/Falso
          </button>
        </div>
      </div>

      {/* Salvar */}
      <button onClick={handleSubmit} disabled={loading}
        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
        {loading ? 'Salvando...' : '🚀 Publicar Quiz!'}
      </button>
    </div>
  )
}
