import api from './client'
import { Tag } from '../types'

export const getTags = () =>
  api.get<Tag[]>('/tags/').then((r) => r.data)

export const createTag = (name: string) =>
  api.post<Tag>('/tags/', { name }).then((r) => r.data)

export const deleteTag = (id: number) =>
  api.delete(`/tags/${id}`)
