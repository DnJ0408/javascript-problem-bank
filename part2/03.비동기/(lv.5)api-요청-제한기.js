/**
 * [(lv.5)api-요청-제한기.js]
 *
 * 1) createRateLimiter 함수를 작성하세요.
 * 2) 주어진 시간(timeWindow) 내에 최대 maxRequests번까지 요청을 처리해야 합니다.
 * 3) 요청이 제한을 초과하면, 큐에 대기시켰다가 순차적으로 처리하세요.
 * 4) 모든 요청은 Promise로 처리되어야 합니다.
 *
 * 힌트:
 * 1. 큐를 사용하여 대기 중인 요청을 관리하세요
 * 2. 요청 시간을 기록하여 timeWindow 내의 요청 수를 추적하세요
 * 3. setTimeout을 활용하여 제한된 요청을 지연 실행하세요
 * 4. Promise를 사용하여 비동기 처리를 구현하세요
 *
 * 예시:
 * const rateLimitedRequest = createRateLimiter(2, 1000); // 1초에 최대 2개 요청
 *
 * // 동시에 3개 요청
 * Promise.all([
 *   rateLimitedRequest(() => fetch('/api/1')), // 즉시 실행
 *   rateLimitedRequest(() => fetch('/api/2')), // 즉시 실행
 *   rateLimitedRequest(() => fetch('/api/3'))  // 1초 후 실행
 * ]);
 *
 * @param {number} maxRequests - 최대 허용 요청 수
 * @param {number} timeWindow - 시간 윈도우 (ms)
 * @returns {(fn: () => Promise<any>) => Promise<any>}
 */

function createRateLimiter(maxRequests, timeWindow) {
  let requestTimestamps = []; // 요청 타임스탬프 저장 배열
  let queue = []; // 대기 중인 요청을 저장하는 큐

  function processQueue() {
    if (queue.length === 0) return; // 큐가 비어 있으면 처리할 필요 없음

    const now = Date.now();
    // timeWindow를 벗어난 오래된 요청 삭제
    requestTimestamps = requestTimestamps.filter(ts => now - ts < timeWindow);

    if (requestTimestamps.length < maxRequests) {
      // 요청 실행 가능하면 큐에서 하나 빼서 실행
      const { fn, resolve, reject } = queue.shift();
      requestTimestamps.push(Date.now()); // 실행된 요청의 타임스탬프 추가

      fn()
        .then(resolve) // 성공하면 resolve 호출
        .catch(reject) // 실패하면 reject 호출
        .finally(() => {
          // 요청이 끝난 후 다음 요청을 처리
          setTimeout(processQueue, timeWindow / maxRequests);
        });
    } else {
      // 제한 초과 시, 일정 시간 후 다시 확인
      setTimeout(processQueue, timeWindow / maxRequests);
    }
  }

  return function rateLimitedRequest(fn) {
    return new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject }); // 요청을 큐에 추가
      processQueue(); // 요청 처리 시도
    });
  };
}

// export 를 수정하지 마세요.
export { createRateLimiter };
