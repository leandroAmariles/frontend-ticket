import { decodeJwtPayload } from '../jwt.util';

function makeToken(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
}

describe('decodeJwtPayload', () => {
  it('decodes a well-formed JWT payload', () => {
    const token = makeToken({ role: 'ADMIN', username: 'alice' });
    expect(decodeJwtPayload(token)).toEqual({ role: 'ADMIN', username: 'alice' });
  });

  it('returns null for a token with the wrong number of segments', () => {
    expect(decodeJwtPayload('not-a-jwt')).toBeNull();
  });

  it('returns null for a token with invalid base64/JSON in the payload', () => {
    expect(decodeJwtPayload('header.not-valid-base64!!.sig')).toBeNull();
  });

  it('handles base64url-encoded payloads (- and _ characters)', () => {
    // A payload whose JSON contains characters that base64url-encode using '-' or '_'
    const token = makeToken({ role: 'ADMIN', note: '???>>>' });
    expect(decodeJwtPayload<{ role: string }>(token)?.role).toBe('ADMIN');
  });
});
