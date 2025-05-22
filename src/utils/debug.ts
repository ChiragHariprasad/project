// Debug utility for consistent logging
export const debug = {
  log: (context: string, message: string, data?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${context}] ${message}`, data !== undefined ? data : '');
    }
  },
  
  error: (context: string, message: string, error?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[${context}] ERROR: ${message}`, error || '');
    }
  },
  
  warn: (context: string, message: string, data?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[${context}] WARNING: ${message}`, data !== undefined ? data : '');
    }
  },
  
  info: (context: string, message: string, data?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[${context}] INFO: ${message}`, data !== undefined ? data : '');
    }
  }
};