export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

type ApiJsonInit = Omit<RequestInit, 'body'> & {
  json?: unknown;
};

export async function apiJson<T>(url: string, init?: ApiJsonInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const body = init?.json === undefined ? undefined : JSON.stringify(init.json);

  if (body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { ...init, headers, body });
  const contentType = res.headers.get('content-type') ?? '';

  const parseBody = async (): Promise<unknown> => {
    if (contentType.includes('application/json')) return res.json();
    const text = await res.text();
    if (!text) return null;
    return text;
  };

  const payload = await parseBody();

  if (!res.ok) {
    const message =
      typeof payload === 'object' && payload && 'detail' in payload
        ? String((payload as { detail: unknown }).detail)
        : `HTTP ${res.status}`;
    throw new ApiError(res.status, message, payload);
  }

  return payload as T;
}

