/**
 * Creates a throttled function that only invokes the provided function at most once per
 * every `wait` milliseconds.
 *
 * @param {Function} func - The function to throttle
 * @param {number} wait - The number of milliseconds to throttle invocations to
 * @returns {Function} - The throttled function
 */
export function throttle(func, wait) {
  let timeout = null;
  let lastArgs = null;
  let lastThis = null;
  let lastCallTime = 0;
  
  const invoke = (thisArg, args) => {
    func.apply(thisArg, args);
    lastCallTime = Date.now();
  };
  
  function throttled(...args) {
    const now = Date.now();
    const remaining = wait - (now - lastCallTime);
    
    lastArgs = args;
    lastThis = this;
    
    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      invoke(lastThis, lastArgs);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        timeout = null;
        invoke(lastThis, lastArgs);
      }, remaining);
    }
  }
  
  throttled.cancel = function() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    lastCallTime = 0;
    lastArgs = null;
    lastThis = null;
  };
  
  return throttled;
}

/**
 * Creates a debounced function that delays invoking the provided function until after
 * `wait` milliseconds have elapsed since the last time the debounced function was invoked.
 *
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} - The debounced function
 */
export function debounce(func, wait) {
  let timeout = null;
  
  function debounced(...args) {
    const later = () => {
      timeout = null;
      func.apply(this, args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  }
  
  debounced.cancel = function() {
    clearTimeout(timeout);
    timeout = null;
  };
  
  return debounced;
}

export default {
  throttle,
  debounce
};