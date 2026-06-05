import { Note } from '../types'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Pin, Image } from 'lucide-react'

interface Props { note: Note }

export default function NoteCard({ note }: Props) {
  const navigate = useNavigate()
  const thumb = note.media[0]?.url

  return (
    <div className={`note-card ${note.is_pinned ? 'pinned' : ''}`} onClick={() => navigate(`/notes/${note.id}`)}>
      {thumb && <div className="note-thumb"><img src={thumb} alt="" /></div>}
      <div className="note-body">
        <div className="note-header">
          <span className="note-title">{note.title}</span>
          {note.is_pinned && <Pin size={13} className="pin-icon" />}
        </div>
        {note.content && <p className="note-preview">{note.content}</p>}
        <div className="note-footer">
          <div className="note-tags">
            {note.tags.slice(0, 3).map(t => (
              <span key={t.id} className="tag-pill">{t.name}</span>
            ))}
          </div>
          <div className="note-meta">
            {note.media.length > 0 && <Image size={12} />}
            <span>{formatDistanceToNow(new Date(note.updated_at), { locale: ptBR, addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
