export interface User {
  id: number
  name: string
  email: string
  created_at: string
}

export interface Tag {
  id: number
  name: string
  created_at: string
}

export interface Media {
  id: number
  filename: string
  url: string
  mime_type: string
  size_bytes: number
  created_at: string
}

export interface Note {
  id: number
  title: string
  content: string | null
  is_pinned: boolean
  created_at: string
  updated_at: string
  tags: Tag[]
  media: Media[]
}

export interface Token {
  access_token: string
  token_type: string
  user: User
}
