import { nanoid } from "nanoid";

export function createId(size = 10) {
  return nanoid(size);
}
