import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getNote, createNote, updateNote, deleteNote } from '../api/notes'
import { getTags, createTag } from '../api/tags'
import { uploadMedia, deleteMedia } from '../api/media'
import { Note, Tag } from '../types'
import toast from 'react-hot-toast'
import { ArrowLeft, Pin, Trash2, Upload, X, Plus } from 'lucide-react'

export default function NoteEditor() {
  const { id } = useParams()
  const isNew = id === 'new'
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [note, setNote] = useState<Note | null>(null)
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(!isNew)

  useEffect(() => {
    getTags().then(setAllTags).catch(() => {})
    if (!isNew && id) {
      getNote(Number(id)).then(n => {
        setNote(n)
        setTitle(n.title)
        setContent(n.content || '')
        setIsPinned(n.is_pinned)
        setSelectedTagIds(n.tags.map(t => t.id))
        setLoading(false)
      }).catch(() => { toast.error('Nota não encontrada'); navigate('/') })
    }
  }, [id])

  const save = async () => {
    if (!title.trim()) { toast.error('Título obrigatório'); return }
    setSaving(true)
    try {
      const payload = { title, content, is_pinned: isPinned, tag_ids: selectedTagIds }
      if (isNew) {
        const created = await createNote(payload)
        toast.success('Nota criada!')
        navigate(`/notes/${created.id}`)
      } else {
        const updated = await updateNote(Number(id), payload)
        setNote(updated)
        toast.success('Salvo!')
      }
    } catch { toast.error('Erro ao salvar') } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Excluir esta nota?')) return
    await deleteNote(Number(id))
    toast.success('Nota excluída')
    navigate('/')
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !note) return
    setUploading(true)
    try {
      const media = await uploadMedia(note.id, file)
      setNote(prev => prev ? { ...prev, media: [...prev.media, media] } : prev)
      toast.success('Imagem adicionada!')
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Erro no upload') }
    finally { setUploading(false) }
  }

  const handleDeleteMedia = async (mediaId: number) => {
    if (!note) return
    await deleteMedia(note.id, mediaId)
    setNote(prev => prev ? { ...prev, media: prev.media.filter(m => m.id !== mediaId) } : prev)
    toast.success('Imagem removida')
  }

  const toggleTag = (id: number) =>
    setSelectedTagIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const handleNewTag = async (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' || !newTagName.trim()) return
    try {
      const tag = await createTag(newTagName.trim())
      setAllTags(prev => [...prev, tag])
      setSelectedTagIds(prev => [...prev, tag.id])
      setNewTagName('')
    } catch { toast.error('Erro ao criar tag') }
  }

  if (loading) return <div className="loading-screen">Carregando...</div>

  return (
    <div className="editor-layout">
      <header className="editor-header">
        <button className="btn-icon" onClick={() => navigate('/')}><ArrowLeft size={18} /></button>
        <div className="editor-actions">
          <button className={`btn-icon ${isPinned ? 'active' : ''}`} onClick={() => setIsPinned(p => !p)} title="Fixar">
            <Pin size={16} />
          </button>
          {!isNew && (
            <button className="btn-icon danger" onClick={handleDelete} title="Excluir">
              <Trash2 size={16} />
            </button>
          )}
          <button className="btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </header>

      <div className="editor-body">
        <div className="editor-main">
          <input
            className="editor-title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título da nota..."
          />
          <textarea
            className="editor-content"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Escreva suas anotações aqui..."
          />
        </div>

        <aside className="editor-sidebar">
          <div className="editor-section">
            <h3>Assuntos</h3>
            <div className="tags-selector">
              {allTags.map(t => (
                <button
                  key={t.id}
                  className={`tag-toggle ${selectedTagIds.includes(t.id) ? 'selected' : ''}`}
                  onClick={() => toggleTag(t.id)}
                >
                  {t.name}
                </button>
              ))}
              <input
                className="tag-input-sm"
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                onKeyDown={handleNewTag}
                placeholder="+ novo assunto"
              />
            </div>
          </div>

          <div className="editor-section">
            <h3>Imagens</h3>
            {note?.media.map(m => (
              <div key={m.id} className="media-thumb">
                <img src={m.url} alt="" />
                <button className="media-del" onClick={() => handleDeleteMedia(m.id)}><X size={12} /></button>
              </div>
            ))}
            {note ? (
              <label className={`upload-btn ${uploading ? 'loading' : ''}`}>
                <Upload size={14} />
                {uploading ? 'Enviando...' : 'Adicionar imagem'}
                <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} />
              </label>
            ) : (
              <p className="upload-hint">Salve a nota primeiro para adicionar imagens.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
