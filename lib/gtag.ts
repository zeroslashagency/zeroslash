export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-5WHBQG0GVE"

// Allow TypeScript to know about window.gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

export const pageview = (url: string) => {
  if (typeof window === "undefined" || !window.gtag) return
  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  })
}

export const track = (eventName: string, params?: Record<string, any>) => {
  if (typeof window === "undefined" || !window.gtag) return
  window.gtag("event", eventName, params || {})
}
