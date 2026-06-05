import api from './client'
import { Media } from '../types'

export const uploadMedia = (noteId: number, file: File) => {
  const form = new FormData()
  form.append('file', file)
  return api.post<Media>(`/notes/${noteId}/media/`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data)
}

export const deleteMedia = (noteId: number, mediaId: number) =>
  api.delete(`/notes/${noteId}/media/${mediaId}`)
