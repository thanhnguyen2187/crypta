export async function waitUntil(
  predicate: () => Promise<boolean>,
  checkIntervalMs = 100,
  timeoutMs = 5000,
) {
  return new Promise(
    resolve => {
      const interval = setInterval(
        () => {
          predicate().then(
            value => {
              if (value) {
                clearInterval(interval)
                resolve(null)
              }
            }
          )
        },
        checkIntervalMs,
      )
      setTimeout(
        () => {
          clearInterval(interval)
          resolve(null)
        },
        timeoutMs,
      )
    },
  )
}
