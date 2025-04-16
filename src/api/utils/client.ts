import { API_BASE } from './config';

export class HttpError extends Error {
    constructor(public status: number, public body: string | Record<string, unknown>) {
        super(typeof body === 'string' ? body : JSON.stringify(body));
        this.name = 'HttpError';
    }
}

export async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    if (path.startsWith('/'))
        path = path.substring(1, path.length);

    const url = `${API_BASE}/${path}`;
    const headers = { 'Content-Type': 'application/json', ...(options.headers ?? {}) };
    const init: RequestInit = { ...options, headers };

    if (options.body && typeof options.body !== 'string') 
        init.body = JSON.stringify(options.body);
  
    let response: Response;

    try {
        response = await fetch(url, init);
    } catch (networkError) {
        console.error('[API] HTTP error:', networkError);
        throw networkError;
    }

    const text = await response.text();
    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json') ? JSON.parse(text) as Record<string, unknown> : text;

    if (!response.ok)
        throw new HttpError(response.status, body);

    return body as T;
}
