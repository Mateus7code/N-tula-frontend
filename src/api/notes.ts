import api from './client'
import { Note } from '../types'

export const getNotes = (tag_id?: number) =>
  api.get<Note[]>('/notes/', { params: tag_id ? { tag_id } : {} }).then((r) => r.data)

export const getNote = (id: number) =>
  api.get<Note>(`/notes/${id}`).then((r) => r.data)

export const createNote = (data: { title: string; content?: string; tag_ids?: number[] }) =>
  api.post<Note>('/notes/', data).then((r) => r.data)

export const updateNote = (id: number, data: { title?: string; content?: string; is_pinned?: boolean; tag_ids?: number[] }) =>
  api.patch<Note>(`/notes/${id}`, data).then((r) => r.data)

export const deleteNote = (id: number) =>
  api.delete(`/notes/${id}`)

export const searchNotes = (q: string) =>
  api.get<Note[]>('/search/', { params: { q } }).then((r) => r.data)
