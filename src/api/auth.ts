import api from './client'
import { Token } from '../types'

export const register = (data: { name: string; email: string; password: string }) =>
  api.post<Token>('/auth/register', data).then((r) => r.data)

export const login = (data: { email: string; password: string }) =>
  api.post<Token>('/auth/login', data).then((r) => r.data)
