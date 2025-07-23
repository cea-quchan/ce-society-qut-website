import { escape } from 'html-escaper';
import DOMPurify from 'dompurify';

// در محیط سرور، DOMPurify نیاز به window دارد
const purify = typeof window !== 'undefined' ? DOMPurify : {
  sanitize: (dirty: string) => dirty,
};

export const sanitizeHtml = (html: string): string => {
  // First escape HTML entities
  const escaped = escape(html);
  
  // Then sanitize the HTML
  return purify.sanitize(escaped);
}; 