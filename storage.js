/**
 * MiniAsk — Pure Vanilla JavaScript LocalStorage Controller
 * Provides type-safe persistence for questions, bookmarks, votes, themes, and user submissions.
 */

(function (window) {
  'use strict';

  const STORAGE_KEYS = {
    THEME: 'miniask_theme_pref',
    QUESTIONS: 'miniask_questions_store',
    BOOKMARKS: 'miniask_user_bookmarks',
    VOTES: 'miniask_user_votes',
    FEEDBACK: 'miniask_feedback_messages'
  };

  const MiniAskStorage = {
    /**
     * Test if localStorage is functional.
     */
    isAvailable() {
      try {
        const testKey = '__miniask_test__';
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
        return true;
      } catch (e) {
        return false;
      }
    },

    // -------------------------------------------------------------
    // Theme Management
    // -------------------------------------------------------------
    getTheme() {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEYS.THEME);
        if (saved === 'light' || saved === 'dark') {
          return saved;
        }
        // Fallback to system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
        return 'light';
      } catch (e) {
        return 'light';
      }
    },

    setTheme(theme) {
      try {
        window.localStorage.setItem(STORAGE_KEYS.THEME, theme);
      } catch (e) {
        console.warn('MiniAsk: Failed to save theme in localStorage', e);
      }
    },

    // -------------------------------------------------------------
    // Questions Management
    // -------------------------------------------------------------
    getQuestions() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEYS.QUESTIONS);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : null;
      } catch (e) {
        console.error('MiniAsk: Error reading questions from localStorage', e);
        return null;
      }
    },

    saveQuestions(questions) {
      try {
        window.localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
        return true;
      } catch (e) {
        console.error('MiniAsk: Failed to save questions to localStorage', e);
        return false;
      }
    },

    addQuestion(question) {
      const current = this.getQuestions() || [];
      const updated = [question, ...current];
      this.saveQuestions(updated);
      return updated;
    },

    updateQuestion(id, updates) {
      const current = this.getQuestions() || [];
      const index = current.findIndex((q) => q.id === id);
      if (index === -1) return false;

      current[index] = {
        ...current[index],
        ...updates
      };
      this.saveQuestions(current);
      return current[index];
    },

    // -------------------------------------------------------------
    // Bookmarks Management
    // -------------------------------------------------------------
    getBookmarks() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    },

    isBookmarked(questionId) {
      const bookmarks = this.getBookmarks();
      return bookmarks.includes(questionId);
    },

    toggleBookmark(questionId) {
      const bookmarks = this.getBookmarks();
      const index = bookmarks.indexOf(questionId);
      let isSaved = false;

      if (index > -1) {
        bookmarks.splice(index, 1);
        isSaved = false;
      } else {
        bookmarks.push(questionId);
        isSaved = true;
      }

      try {
        window.localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
      } catch (e) {
        console.error('MiniAsk: Could not save bookmark state', e);
      }

      return { isBookmarked: isSaved, count: bookmarks.length };
    },

    // -------------------------------------------------------------
    // Upvote / Downvote Vote Tracking
    // -------------------------------------------------------------
    getUserVotes() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEYS.VOTES);
        return raw ? JSON.parse(raw) : {};
      } catch (e) {
        return {};
      }
    },

    getUserVote(questionId) {
      const votes = this.getUserVotes();
      return votes[questionId] || 0; // 1 for upvoted, -1 for downvoted, 0 for neutral
    },

    recordVote(questionId, direction) {
      const votes = this.getUserVotes();
      const currentVote = votes[questionId] || 0;
      let newVote = direction;

      // Toggle off if clicking the same vote twice
      if (currentVote === direction) {
        newVote = 0;
      }

      votes[questionId] = newVote;

      try {
        window.localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(votes));
      } catch (e) {
        console.error('MiniAsk: Could not save vote', e);
      }

      // Calculate score delta for question
      const delta = newVote - currentVote;
      return { newVote, delta };
    },

    // -------------------------------------------------------------
    // Feedback Form Submissions
    // -------------------------------------------------------------
    saveFeedback(feedbackObj) {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEYS.FEEDBACK);
        const list = raw ? JSON.parse(raw) : [];
        list.push({
          ...feedbackObj,
          id: 'fb_' + Date.now(),
          timestamp: new Date().toISOString()
        });
        window.localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(list));
        return true;
      } catch (e) {
        console.error('MiniAsk: Could not save feedback', e);
        return false;
      }
    },

    getFeedbackList() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEYS.FEEDBACK);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    },

    // -------------------------------------------------------------
    // Storage Reset / Purge
    // -------------------------------------------------------------
    clearQuestions() {
      try {
        window.localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
      } catch (e) {}
    },

    resetAllData() {
      try {
        window.localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
        window.localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
        window.localStorage.removeItem(STORAGE_KEYS.VOTES);
      } catch (e) {}
    }
  };

  window.MiniAskStorage = MiniAskStorage;
})(window);
