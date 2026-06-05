import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNotes, searchNotes } from '../api/notes'
import { getTags, createTag, deleteTag } from '../api/tags'
import { useAuthStore } from '../store/auth'
import { Note, Tag } from '../types'
import NoteCard from '../components/NoteCard'
import toast from 'react-hot-toast'
import { Plus, Search, LogOut, Tag as TagIcon, X, BookOpen } from 'lucide-react'

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [activeTag, setActiveTag] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [newTag, setNewTag] = useState('')
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const loadNotes = useCallback(async () => {
    setLoading(true)
    try {
      const data = query
        ? await searchNotes(query)
        : await getNotes(activeTag ?? undefined)
      setNotes(data)
    } catch {
      toast.error('Erro ao carregar notas')
    } finally {
      setLoading(false)
    }
  }, [query, activeTag])

  const loadTags = async () => {
    try { setTags(await getTags()) } catch {}
  }

  useEffect(() => { loadTags() }, [])
  useEffect(() => {
    const t = setTimeout(loadNotes, query ? 400 : 0)
    return () => clearTimeout(t)
  }, [loadNotes, query])

  const handleCreateTag = async (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' || !newTag.trim()) return
    try {
      const tag = await createTag(newTag.trim())
      setTags(prev => [...prev, tag])
      setNewTag('')
    } catch { toast.error('Erro ao criar tag') }
  }

  const handleDeleteTag = async (id: number) => {
    try {
      await deleteTag(id)
      setTags(prev => prev.filter(t => t.id !== id))
      if (activeTag === id) setActiveTag(null)
    } catch { toast.error('Erro ao remover tag') }
  }

  const pinned = notes.filter(n => n.is_pinned)
  const rest = notes.filter(n => !n.is_pinned)

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="app-brand">📓 Nótula</div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <button className="btn-icon" onClick={() => { logout(); navigate('/login') }} title="Sair">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTag === null ? 'active' : ''}`} onClick={() => { setActiveTag(null); setQuery('') }}>
            <BookOpen size={15} /> Todas as notas
            <span className="nav-count">{notes.length}</span>
          </button>
        </nav>

        <div className="sidebar-section">
          <div className="sidebar-label"><TagIcon size={12} /> Assuntos</div>
          <div className="tags-list">
            {tags.map(t => (
              <div key={t.id} className={`tag-nav-item ${activeTag === t.id ? 'active' : ''}`}>
                <button className="tag-nav-btn" onClick={() => { setActiveTag(t.id); setQuery('') }}>
                  {t.name}
                </button>
                <button className="tag-del-btn" onClick={() => handleDeleteTag(t.id)}><X size={11} /></button>
              </div>
            ))}
            <input
              className="tag-input"
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={handleCreateTag}
              placeholder="+ novo assunto"
            />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <div className="topbar">
          <div className="search-box">
            <Search size={15} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar notas, assuntos..."
            />
            {query && <button onClick={() => setQuery('')}><X size={14} /></button>}
          </div>
          <button className="btn-new" onClick={() => navigate('/notes/new')}>
            <Plus size={16} /> Nova nota
          </button>
        </div>

        <div className="notes-area">
          {loading ? (
            <div className="empty-state">Carregando...</div>
          ) : notes.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma nota encontrada.</p>
              <button className="btn-primary" onClick={() => navigate('/notes/new')}>Criar primeira nota</button>
            </div>
          ) : (
            <>
              {pinned.length > 0 && (
                <section>
                  <h2 className="section-label">📌 Fixadas</h2>
                  <div className="notes-grid">{pinned.map(n => <NoteCard key={n.id} note={n} />)}</div>
                </section>
              )}
              {rest.length > 0 && (
                <section>
                  {pinned.length > 0 && <h2 className="section-label">Outras notas</h2>}
                  <div className="notes-grid">{rest.map(n => <NoteCard key={n.id} note={n} />)}</div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
