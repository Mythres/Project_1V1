export function waitForMilliseconds(time: number): Promise<void> {
  return new Promise((resolve, _reject) => {
    let wait = setTimeout(() => {
      clearTimeout(wait);
      resolve();
    }, time)
  })
}
