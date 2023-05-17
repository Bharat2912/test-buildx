export function genRandomOTP(size = 8) {
  const arr = [];
  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * 9));
  }
  const res = arr.join('');
  return res;
}
