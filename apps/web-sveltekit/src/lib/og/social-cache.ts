import { createHash } from 'node:crypto';
export const socialObjectKey = (key:string,element:unknown) => `social/${createHash('sha256').update(key).update(JSON.stringify(element)).digest('hex')}.png`;
