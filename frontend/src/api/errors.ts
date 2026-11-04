/** Единый формат ошибок бэкенда: {"detail", "code", "details"} (см. src/exceptions.py). */
export class ApiError extends Error {
  status: number
  code: string
  details: unknown

  constructor(status: number, message: string, code = 'error', details: unknown = null) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}
