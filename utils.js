/**
 * MiniAsk — Pure Vanilla JavaScript Utilities
 * Safe helper functions for UI rendering, formatting, toast alerts, and security.
 */

(function (window) {
  'use strict';

  const MiniAskUtils = {
    /**
     * Escape special HTML characters to prevent XSS injection.
     * @param {string} str
     * @returns {string}
     */
    escapeHTML(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },

    /**
     * Human-friendly relative timestamp (e.g. "Just now", "5m ago", "2h ago", "3d ago").
     * @param {string|number|Date} dateInput
     * @returns {string}
     */
    formatRelativeTime(dateInput) {
      if (!dateInput) return 'Recently';
      const date = new Date(dateInput);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();

      if (isNaN(diffMs) || diffMs < 0) return 'Just now';

      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffSec < 45) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHour < 24) return `${diffHour}h ago`;
      if (diffDay === 1) return 'Yesterday';
      if (diffDay < 30) return `${diffDay}d ago`;

      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    },

    /**
     * Format a date into standard readable format.
     * @param {string|number|Date} dateInput
     * @returns {string}
     */
    formatDate(dateInput) {
      if (!dateInput) return '';
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    },

    /**
     * Truncate text cleanly with ellipsis.
     * @param {string} text
     * @param {number} max
     * @returns {string}
     */
    truncate(text, max = 140) {
      if (!text) return '';
      if (text.length <= max) return text;
      return text.slice(0, max).trimEnd() + '…';
    },

    /**
     * Standard debounce function.
     * @param {Function} func
     * @param {number} wait
     * @returns {Function}
     */
    debounce(func, wait = 250) {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    },

    /**
     * Copy text to clipboard safely.
     * @param {string} text
     * @returns {Promise<boolean>}
     */
    async copyToClipboard(text) {
      if (!text) return false;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          return true;
        }
      } catch (err) {
        // Fallback for older browsers or file:// context
      }

      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        textArea.setAttribute('readonly', '');
        document.body.appendChild(textArea);
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
      } catch (e) {
        return false;
      }
    },

    /**
     * Display a sleek, accessible toast notification.
     * @param {string} message
     * @param {'info'|'success'|'warning'|'error'} type
     * @param {number} duration
     */
    showToast(message, type = 'info', duration = 3000) {
      let container = document.getElementById('miniask-toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'miniask-toast-container';
        container.className = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `toast-item toast-${type}`;
      toast.setAttribute('role', 'alert');

      const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
      };

      toast.innerHTML = `
        <span class="toast-icon">${icons[type] || 'ℹ'}</span>
        <span class="toast-message">${this.escapeHTML(message)}</span>
        <button class="toast-close" aria-label="Dismiss alert">&times;</button>
      `;

      const removeToast = () => {
        toast.classList.add('toast-fade-out');
        toast.addEventListener('animationend', () => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        });
      };

      toast.querySelector('.toast-close').addEventListener('click', removeToast);
      container.appendChild(toast);

      setTimeout(removeToast, duration);
    },

    /**
     * Generate unique client-side ID.
     * @param {string} prefix
     * @returns {string}
     */
    generateId(prefix = 'q') {
      return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    },

    /**
     * Lightweight syntax highlighter without external dependencies.
     * Tokenizes code strings into keyword, string, comment, and number spans.
     * @param {string} rawCode
     * @param {string} lang
     * @returns {string}
     */
    renderCodeBlock(rawCode, lang = 'code') {
      const escaped = this.escapeHTML(rawCode.trim());

      // Simple regex token replacement on safe escaped text
      const highlighted = escaped
        // Comments
        .replace(/(#.*|\/\/.*)$/gm, '<span class="tok-comment">$1</span>')
        // Strings
        .replace(/(&quot;.*?&quot;|&#39;.*?&#39;|`.*?`)/g, '<span class="tok-string">$1</span>')
        // Keywords
        .replace(/\b(def|return|for|in|import|from|class|if|else|elif|try|except|as|async|await|const|let|var|function|throw|new|typeof|interface|type)\b/g, '<span class="tok-keyword">$1</span>')
        // Builtins / Booleans
        .replace(/\b(True|False|None|true|false|null|undefined|print|console|Math|Array|Object)\b/g, '<span class="tok-builtin">$1</span>')
        // Numbers
        .replace(/\b(\d+)\b/g, '<span class="tok-number">$1</span>');

      return `
        <div class="code-block-wrapper">
          <div class="code-block-header">
            <span class="code-lang-tag">${this.escapeHTML(lang)}</span>
            <button class="copy-code-btn" type="button" aria-label="Copy code snippet">
              <span class="copy-btn-icon">📋</span>
              <span class="copy-btn-text">Copy Code</span>
            </button>
          </div>
          <pre class="code-block-body"><code>${highlighted}</code></pre>
        </div>
      `;
    }
  };

  window.MiniAskUtils = MiniAskUtils;
})(window);
