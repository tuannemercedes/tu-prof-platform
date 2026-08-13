// sem caracteres ambíguos (0/O, 1/l/I) para facilitar digitar/ler em voz alta
const CHARS = "abcdefghjkmnpqrstuvwxyz23456789";

export function generatePassword(length = 8) {
  let password = "";
  for (let i = 0; i < length; i++) {
    password += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return password;
}
