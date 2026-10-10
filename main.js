/**
 * MiniAsk — Main Application Controller
 * Handles UI interactions, rendering, filtering, sorting, theme switching,
 * voting, bookmarks, and form validation using pure Vanilla JavaScript.
 */

(function (window, document) {
  'use strict';

  // Application State
  const state = {
    currentCategory: 'all',
    searchQuery: '',
    sortBy: 'recent', // 'recent' | 'upvotes' | 'views'
    bookmarksOnly: false,
    expandedCardIds: new Set(),
    isGeneratingAnswer: false,
    generatedAnswer: null
  };

  // DOM Elements Cache
  let elements = {};

  /**
   * Initialize DOM References
   */
  function cacheElements() {
    elements = {
      html: document.documentElement,
      themeToggleBtn: document.getElementById('theme-toggle-btn'),
      themeIcon: document.getElementById('theme-icon'),
      themeLabel: document.getElementById('theme-label'),
      mobileMenuBtn: document.getElementById('mobile-menu-btn'),
      navMenu: document.getElementById('nav-menu'),
      bookmarksBadge: document.getElementById('header-bookmarks-badge'),
      headerBookmarksLink: document.getElementById('nav-bookmarks-link'),

      // Ask Box & Answer Engine
      askForm: document.getElementById('ask-form'),
      askInput: document.getElementById('ask-input'),
      askCategorySelect: document.getElementById('ask-category-select'),
      askSubmitBtn: document.getElementById('ask-submit-btn'),
      askSpinner: document.getElementById('ask-spinner'),
      askBtnText: document.getElementById('ask-btn-text'),
      answerResultCard: document.getElementById('answer-result-card'),
      answerResultContent: document.getElementById('answer-result-content'),
      publishToFeedBtn: document.getElementById('publish-to-feed-btn'),
      dismissAnswerBtn: document.getElementById('dismiss-answer-btn'),
      trendingChipsContainer: document.getElementById('trending-chips-container'),

      // Feed Controls & Container
      categoryPillsContainer: document.getElementById('category-pills-container'),
      searchInput: document.getElementById('search-input'),
      sortSelect: document.getElementById('sort-select'),
      bookmarksFilterToggle: document.getElementById('bookmarks-filter-toggle'),
      questionsListContainer: document.getElementById('questions-list-container'),
      feedCountBadge: document.getElementById('feed-count-badge'),
      emptyStateContainer: document.getElementById('empty-state-container'),
      clearFiltersBtn: document.getElementById('clear-filters-btn'),

      // Feedback Form
      feedbackForm: document.getElementById('feedback-form'),
      fbNameInput: document.getElementById('fb-name'),
      fbEmailInput: document.getElementById('fb-email'),
      fbCategorySelect: document.getElementById('fb-category'),
      fbMessageInput: document.getElementById('fb-message'),
      fbSuccessNotice: document.getElementById('feedback-success-notice'),

      // Reset Demo Data
      resetDataBtn: document.getElementById('reset-demo-data-btn')
    };
  }

  /**
   * Initialize Seed Data if first run
   */
  function initData() {
    const existing = window.MiniAskStorage.getQuestions();
    if (!existing || existing.length === 0) {
      const defaultSeeds = window.MiniAskQuestions.getDefaultSeeds();
      window.MiniAskStorage.saveQuestions(defaultSeeds);
    }
  }

  /**
   * Theme Controller
   */
  function initTheme() {
    const savedTheme = window.MiniAskStorage.getTheme();
    applyTheme(savedTheme, false);

    if (elements.themeToggleBtn) {
      elements.themeToggleBtn.addEventListener('click', () => {
        const current = elements.html.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next, true);
      });
    }
  }

  function applyTheme(theme, showNotification = false) {
    elements.html.setAttribute('data-theme', theme);
    window.MiniAskStorage.setTheme(theme);

    if (elements.themeIcon && elements.themeLabel) {
      if (theme === 'dark') {
        elements.themeIcon.textContent = '🌙';
        elements.themeLabel.textContent = 'Dark';
      } else {
        elements.themeIcon.textContent = '☀️';
        elements.themeLabel.textContent = 'Light';
      }
    }

    if (showNotification) {
      window.MiniAskUtils.showToast(
        `Switched to ${theme === 'dark' ? 'Dark' : 'Light'} theme`,
        'info',
        2000
      );
    }
  }

  /**
   * Update Bookmarks Badge count across the interface
   */
  function updateBookmarksCounter() {
    const bookmarks = window.MiniAskStorage.getBookmarks();
    const count = bookmarks.length;
    if (elements.bookmarksBadge) {
      elements.bookmarksBadge.textContent = count;
      elements.bookmarksBadge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
  }

  /**
   * Render Category Filter Pills
   */
  function renderCategoryPills() {
    if (!elements.categoryPillsContainer) return;
    const categories = window.MiniAskQuestions.getCategories();

    elements.categoryPillsContainer.innerHTML = categories
      .map(
        (cat) => `
        <button 
          type="button" 
          class="category-pill ${state.currentCategory === cat.id ? 'active' : ''}" 
          data-cat-id="${cat.id}"
          role="tab"
          aria-selected="${state.currentCategory === cat.id}">
          <span class="pill-icon">${cat.icon}</span>
          <span>${cat.label}</span>
        </button>
      `
      )
      .join('');

    elements.categoryPillsContainer.querySelectorAll('.category-pill').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const targetBtn = e.currentTarget;
        const catId = targetBtn.getAttribute('data-cat-id');
        setCategoryFilter(catId);
      });
    });
  }

  function setCategoryFilter(catId) {
    state.currentCategory = catId;
    elements.categoryPillsContainer.querySelectorAll('.category-pill').forEach((btn) => {
      const isSelected = btn.getAttribute('data-cat-id') === catId;
      btn.classList.toggle('active', isSelected);
      btn.setAttribute('aria-selected', isSelected);
    });
    renderQuestionsList();
  }

  /**
   * Render Trending Chips
   */
  function renderTrendingChips() {
    if (!elements.trendingChipsContainer) return;
    const trending = window.MiniAskQuestions.getTrending();

    elements.trendingChipsContainer.innerHTML = trending
      .map(
        (t) => `
        <button type="button" class="trending-chip" data-query="${window.MiniAskUtils.escapeHTML(t.query)}" data-cat="${t.category}">
          <span class="chip-trend-icon">⚡</span>
          <span>${window.MiniAskUtils.escapeHTML(t.label)}</span>
        </button>
      `
      )
      .join('');

    elements.trendingChipsContainer.querySelectorAll('.trending-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query');
        const cat = chip.getAttribute('data-cat');
        if (elements.askInput) {
          elements.askInput.value = query;
          if (elements.askCategorySelect && cat) {
            elements.askCategorySelect.value = cat;
          }
          elements.askInput.focus();
          // Smooth scroll to the ask box
          document.getElementById('ask-section')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /**
   * Filter and Sort questions
   */
  function getFilteredAndSortedQuestions() {
    let questions = window.MiniAskStorage.getQuestions() || [];
    const bookmarks = window.MiniAskStorage.getBookmarks();

    // 1. Filter by Category
    if (state.currentCategory !== 'all') {
      questions = questions.filter((q) => q.category === state.currentCategory);
    }

    // 2. Filter by Search Query
    if (state.searchQuery.trim()) {
      const qLower = state.searchQuery.toLowerCase();
      questions = questions.filter((item) => {
        const matchTitle = item.title && item.title.toLowerCase().includes(qLower);
        const matchBody = item.questionBody && item.questionBody.toLowerCase().includes(qLower);
        const matchTags = Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(qLower));
        const matchAnswer = item.answer && (
          (item.answer.summary && item.answer.summary.toLowerCase().includes(qLower)) ||
          (item.answer.explanation && item.answer.explanation.toLowerCase().includes(qLower))
        );
        return matchTitle || matchBody || matchTags || matchAnswer;
      });
    }

    // 3. Filter by Bookmarks Only
    if (state.bookmarksOnly) {
      questions = questions.filter((item) => bookmarks.includes(item.id));
    }

    // 4. Sort
    questions.sort((a, b) => {
      if (state.sortBy === 'upvotes') {
        return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      }
      if (state.sortBy === 'views') {
        return (b.views || 0) - (a.views || 0);
      }
      // default: recent
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return questions;
  }

  /**
   * Render Question Feed Cards
   */
  function renderQuestionsList() {
    if (!elements.questionsListContainer) return;
    const questions = getFilteredAndSortedQuestions();

    if (elements.feedCountBadge) {
      elements.feedCountBadge.textContent = `${questions.length} Question${questions.length === 1 ? '' : 's'}`;
    }

    if (questions.length === 0) {
      elements.questionsListContainer.innerHTML = '';
      elements.emptyStateContainer.style.display = 'block';
      return;
    }

    elements.emptyStateContainer.style.display = 'none';

    elements.questionsListContainer.innerHTML = questions
      .map((q) => renderQuestionCardHTML(q))
      .join('');

    // Attach listeners on newly rendered cards
    attachCardEventListeners();
  }

  /**
   * Generate Question Card HTML
   */
  function renderQuestionCardHTML(q) {
    const isBookmarked = window.MiniAskStorage.isBookmarked(q.id);
    const userVote = window.MiniAskStorage.getUserVote(q.id);
    const isExpanded = state.expandedCardIds.has(q.id);
    const score = (q.upvotes || 0) - (q.downvotes || 0);
    const relativeTime = window.MiniAskUtils.formatRelativeTime(q.createdAt);

    return `
      <article class="question-card" id="card-${q.id}" data-id="${q.id}">
        <!-- Card Header -->
        <header class="card-header">
          <div class="author-info">
            <div class="author-avatar" aria-hidden="true">${window.MiniAskUtils.escapeHTML(q.avatarInitial || 'U')}</div>
            <div class="author-meta">
              <span class="author-name">${window.MiniAskUtils.escapeHTML(q.author || 'Anonymous')}</span>
              <span class="author-role">${window.MiniAskUtils.escapeHTML(q.authorRole || 'Developer')}</span>
            </div>
          </div>
          <div class="card-meta-right">
            <span class="category-badge cat-${q.category || 'general'}">${window.MiniAskUtils.escapeHTML(q.categoryLabel || q.category || 'General')}</span>
            <time class="card-time" datetime="${q.createdAt}">${relativeTime}</time>
            <button 
              type="button" 
              class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" 
              data-id="${q.id}" 
              aria-label="${isBookmarked ? 'Remove from bookmarks' : 'Save to bookmarks'}"
              title="${isBookmarked ? 'Remove bookmark' : 'Bookmark question'}">
              <span class="bookmark-icon">${isBookmarked ? '★' : '☆'}</span>
            </button>
          </div>
        </header>

        <!-- Question Title & Body -->
        <div class="card-body">
          <h3 class="card-title">${window.MiniAskUtils.escapeHTML(q.title)}</h3>
          <p class="card-question-text">${window.MiniAskUtils.escapeHTML(q.questionBody)}</p>

          ${
            q.codeSnippet
              ? window.MiniAskUtils.renderCodeBlock(q.codeSnippet, q.snippetLang || 'code')
              : ''
          }

          ${
            Array.isArray(q.tags) && q.tags.length > 0
              ? `<div class="card-tags-list">
                  ${q.tags.map((t) => `<span class="tag-pill">#${window.MiniAskUtils.escapeHTML(t)}</span>`).join('')}
                </div>`
              : ''
          }
        </div>

        <!-- Expandable Answer Section -->
        <section 
          class="card-answer-section ${isExpanded ? 'is-expanded' : 'is-collapsed'}" 
          id="answer-panel-${q.id}" 
          aria-hidden="${!isExpanded}">
          ${
            q.answer
              ? `
              <div class="answer-wrapper">
                <div class="answer-header">
                  <div class="engine-badge">
                    <span class="badge-icon">⚡</span>
                    <span class="badge-text">${window.MiniAskUtils.escapeHTML(q.answer.engineLabel || 'Demo Heuristic Engine')}</span>
                  </div>
                  <span class="answer-date">${window.MiniAskUtils.formatRelativeTime(q.answer.answeredAt)}</span>
                </div>

                <div class="answer-content">
                  <h4 class="answer-summary">${window.MiniAskUtils.escapeHTML(q.answer.summary)}</h4>
                  <p class="answer-explanation">${window.MiniAskUtils.escapeHTML(q.answer.explanation)}</p>
                  ${
                    q.answer.solutionCode
                      ? window.MiniAskUtils.renderCodeBlock(
                          q.answer.solutionCode,
                          q.answer.solutionLang || 'python'
                        )
                      : ''
                  }
                </div>
              </div>
            `
              : `<div class="no-answer-notice">No verified answer recorded yet.</div>`
          }
        </section>

        <!-- Card Footer Actions -->
        <footer class="card-footer">
          <div class="vote-controls" role="group" aria-label="Vote on question">
            <button 
              type="button" 
              class="vote-btn upvote-btn ${userVote === 1 ? 'active' : ''}" 
              data-id="${q.id}" 
              data-dir="1" 
              aria-label="Upvote question"
              title="Upvote">
              <span class="vote-arrow">▲</span>
            </button>
            <span class="vote-score" id="score-${q.id}" aria-label="${score} net votes">${score}</span>
            <button 
              type="button" 
              class="vote-btn downvote-btn ${userVote === -1 ? 'active' : ''}" 
              data-id="${q.id}" 
              data-dir="-1" 
              aria-label="Downvote question"
              title="Downvote">
              <span class="vote-arrow">▼</span>
            </button>
          </div>

          <div class="footer-stats">
            <span class="stat-item" title="${q.views || 0} Views">
              <span class="stat-icon">👁</span> ${q.views || 0}
            </span>
            <button 
              type="button" 
              class="share-card-btn" 
              data-id="${q.id}"
              data-title="${window.MiniAskUtils.escapeHTML(q.title)}"
              title="Copy question link">
              <span class="share-icon">🔗</span> Share
            </button>
          </div>

          <button 
            type="button" 
            class="expand-toggle-btn" 
            data-id="${q.id}" 
            aria-expanded="${isExpanded}" 
            aria-controls="answer-panel-${q.id}">
            <span class="expand-text">${isExpanded ? 'Hide Answer' : 'Show Answer'}</span>
            <span class="expand-icon">${isExpanded ? '▲' : '▼'}</span>
          </button>
        </footer>
      </article>
    `;
  }

  /**
   * Attach Listeners for dynamically rendered cards
   */
  function attachCardEventListeners() {
    // 1. Expand / Collapse Button
    elements.questionsListContainer.querySelectorAll('.expand-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const qId = btn.getAttribute('data-id');
        const answerPanel = document.getElementById(`answer-panel-${qId}`);
        const expandText = btn.querySelector('.expand-text');
        const expandIcon = btn.querySelector('.expand-icon');

        if (state.expandedCardIds.has(qId)) {
          state.expandedCardIds.delete(qId);
          answerPanel.classList.remove('is-expanded');
          answerPanel.classList.add('is-collapsed');
          btn.setAttribute('aria-expanded', 'false');
          expandText.textContent = 'Show Answer';
          expandIcon.textContent = '▼';
        } else {
          state.expandedCardIds.add(qId);
          answerPanel.classList.remove('is-collapsed');
          answerPanel.classList.add('is-expanded');
          btn.setAttribute('aria-expanded', 'true');
          expandText.textContent = 'Hide Answer';
          expandIcon.textContent = '▲';
        }
      });
    });

    // 2. Bookmark Toggle Button
    elements.questionsListContainer.querySelectorAll('.bookmark-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const qId = btn.getAttribute('data-id');
        const result = window.MiniAskStorage.toggleBookmark(qId);
        btn.classList.toggle('bookmarked', result.isBookmarked);
        btn.querySelector('.bookmark-icon').textContent = result.isBookmarked ? '★' : '☆';
        btn.setAttribute(
          'aria-label',
          result.isBookmarked ? 'Remove from bookmarks' : 'Save to bookmarks'
        );

        updateBookmarksCounter();
        window.MiniAskUtils.showToast(
          result.isBookmarked ? 'Question saved to Bookmarks' : 'Removed from Bookmarks',
          result.isBookmarked ? 'success' : 'info',
          2000
        );

        // If currently viewing bookmarks-only feed, re-render
        if (state.bookmarksOnly) {
          renderQuestionsList();
        }
      });
    });

    // 3. Upvote / Downvote Buttons
    elements.questionsListContainer.querySelectorAll('.vote-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const qId = btn.getAttribute('data-id');
        const dir = parseInt(btn.getAttribute('data-dir'), 10);
        const { newVote, delta } = window.MiniAskStorage.recordVote(qId, dir);

        const card = document.getElementById(`card-${qId}`);
        const upBtn = card.querySelector('.upvote-btn');
        const downBtn = card.querySelector('.downvote-btn');
        const scoreSpan = card.querySelector('.vote-score');

        upBtn.classList.toggle('active', newVote === 1);
        downBtn.classList.toggle('active', newVote === -1);

        // Update score in storage and DOM
        const questions = window.MiniAskStorage.getQuestions();
        const question = questions.find((q) => q.id === qId);
        if (question) {
          if (dir === 1) {
            question.upvotes = (question.upvotes || 0) + delta;
          } else {
            question.downvotes = (question.downvotes || 0) - delta;
          }
          window.MiniAskStorage.updateQuestion(qId, {
            upvotes: question.upvotes,
            downvotes: question.downvotes
          });
          const newScore = (question.upvotes || 0) - (question.downvotes || 0);
          scoreSpan.textContent = newScore;
          scoreSpan.classList.add('vote-bump');
          setTimeout(() => scoreSpan.classList.remove('vote-bump'), 300);
        }
      });
    });

    // 4. Share Card Button
    elements.questionsListContainer.querySelectorAll('.share-card-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const qId = btn.getAttribute('data-id');
        const title = btn.getAttribute('data-title');
        const url = `${window.location.origin}${window.location.pathname}#card-${qId}`;
        const copyText = `${title}\n${url}`;

        const ok = await window.MiniAskUtils.copyToClipboard(copyText);
        window.MiniAskUtils.showToast(
          ok ? 'Link and title copied to clipboard!' : 'Could not access clipboard',
          ok ? 'success' : 'error',
          2500
        );
      });
    });

    // 5. Code Block Copy Buttons
    elements.questionsListContainer.querySelectorAll('.copy-code-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const pre = btn.closest('.code-block-wrapper').querySelector('pre code');
        if (!pre) return;
        const codeText = pre.innerText || pre.textContent;
        const ok = await window.MiniAskUtils.copyToClipboard(codeText);

        const textSpan = btn.querySelector('.copy-btn-text');
        const oldText = textSpan.textContent;
        if (ok) {
          textSpan.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(() => {
            textSpan.textContent = oldText;
            btn.classList.remove('copied');
          }, 2000);
        }
      });
    });
  }

  /**
   * Handle Question Submission & Demo Answer Generation
   */
  function initAskSection() {
    if (!elements.askForm) return;

    elements.askForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const questionText = elements.askInput.value.trim();
      const category = elements.askCategorySelect.value;

      if (!questionText) {
        window.MiniAskUtils.showToast('Please type a question or error message', 'warning', 2500);
        elements.askInput.focus();
        return;
      }

      setAnswerLoading(true);

      try {
        // Simulate local heuristic evaluation delay for micro-animation wow factor
        await new Promise((res) => setTimeout(res, 650));

        const result = await window.MiniAskQuestions.generateDemoAnswer(questionText, category);
        state.generatedAnswer = {
          ...result,
          originalQuestion: questionText,
          category: category !== 'all' ? category : result.category,
          timestamp: new Date().toISOString()
        };

        renderGeneratedAnswer(state.generatedAnswer);
        window.MiniAskUtils.showToast('Heuristic answer generated successfully!', 'success', 2500);
      } catch (err) {
        window.MiniAskUtils.showToast('Error formulating demo answer', 'error', 3000);
      } finally {
        setAnswerLoading(false);
      }
    });

    // Publish to feed button
    if (elements.publishToFeedBtn) {
      elements.publishToFeedBtn.addEventListener('click', () => {
        if (!state.generatedAnswer) return;

        const gen = state.generatedAnswer;
        const newQuestion = {
          id: window.MiniAskUtils.generateId('user_q'),
          title: gen.originalQuestion,
          author: 'You',
          authorRole: 'Community Member',
          avatarInitial: 'Y',
          category: gen.category,
          categoryLabel: gen.categoryLabel,
          tags: [gen.category, 'community-demo'],
          createdAt: new Date().toISOString(),
          views: 1,
          upvotes: 1,
          downvotes: 0,
          isAnswered: true,
          questionBody: gen.originalQuestion,
          codeSnippet: '',
          snippetLang: '',
          answer: {
            summary: gen.summary,
            explanation: gen.explanation,
            solutionCode: gen.codeSnippet ? gen.codeSnippet.replace(/# Heuristic Solution:|\/\/ Heuristic template pattern/g, '').trim() : '',
            solutionLang: gen.codeLang || 'javascript',
            engineLabel: gen.engineLabel,
            answeredAt: new Date().toISOString()
          }
        };

        window.MiniAskStorage.addQuestion(newQuestion);
        state.expandedCardIds.add(newQuestion.id);

        // Hide answer box & reset input
        elements.answerResultCard.style.display = 'none';
        elements.askInput.value = '';
        state.generatedAnswer = null;

        // Re-render feed and scroll to newly added item
        renderQuestionsList();
        const newCard = document.getElementById(`card-${newQuestion.id}`);
        if (newCard) {
          newCard.scrollIntoView({ behavior: 'smooth' });
          newCard.classList.add('highlight-pulse');
          setTimeout(() => newCard.classList.remove('highlight-pulse'), 1500);
        }

        window.MiniAskUtils.showToast('Question published to community feed!', 'success', 3000);
      });
    }

    // Dismiss Answer Button
    if (elements.dismissAnswerBtn) {
      elements.dismissAnswerBtn.addEventListener('click', () => {
        elements.answerResultCard.style.display = 'none';
        state.generatedAnswer = null;
      });
    }
  }

  function setAnswerLoading(isLoading) {
    state.isGeneratingAnswer = isLoading;
    if (elements.askSubmitBtn) {
      elements.askSubmitBtn.disabled = isLoading;
    }
    if (elements.askSpinner) {
      elements.askSpinner.style.display = isLoading ? 'inline-block' : 'none';
    }
    if (elements.askBtnText) {
      elements.askBtnText.textContent = isLoading ? 'Analyzing heuristics…' : 'Ask MiniAsk';
    }
  }

  function renderGeneratedAnswer(ans) {
    if (!elements.answerResultCard || !elements.answerResultContent) return;

    elements.answerResultContent.innerHTML = `
      <div class="result-notice-pill">
        <span class="notice-icon">🛡️</span>
        <span class="notice-text">Client-Side Demo Answer Engine (Offline heuristics • No third-party AI APIs called)</span>
      </div>

      <div class="result-body">
        <h3 class="result-title">${window.MiniAskUtils.escapeHTML(ans.summary)}</h3>
        <p class="result-text">${window.MiniAskUtils.escapeHTML(ans.explanation)}</p>
        ${
          ans.codeSnippet
            ? window.MiniAskUtils.renderCodeBlock(ans.codeSnippet, ans.codeLang || 'code')
            : ''
        }
      </div>
    `;

    // Attach copy button inside newly generated code block
    elements.answerResultContent.querySelectorAll('.copy-code-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const pre = btn.closest('.code-block-wrapper').querySelector('pre code');
        if (!pre) return;
        const codeText = pre.innerText || pre.textContent;
        const ok = await window.MiniAskUtils.copyToClipboard(codeText);
        const textSpan = btn.querySelector('.copy-btn-text');
        if (ok) {
          textSpan.textContent = 'Copied!';
          setTimeout(() => (textSpan.textContent = 'Copy Code'), 2000);
        }
      });
    });

    elements.answerResultCard.style.display = 'block';
    elements.answerResultCard.scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * Search, Sort, and Bookmark Filter Handlers
   */
  function initFeedControls() {
    // Search input with debounce
    if (elements.searchInput) {
      elements.searchInput.addEventListener(
        'input',
        window.MiniAskUtils.debounce((e) => {
          state.searchQuery = e.target.value;
          renderQuestionsList();
        }, 200)
      );
    }

    // Sort Dropdown
    if (elements.sortSelect) {
      elements.sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        renderQuestionsList();
      });
    }

    // Bookmarks Filter Toggle
    if (elements.bookmarksFilterToggle) {
      elements.bookmarksFilterToggle.addEventListener('change', (e) => {
        state.bookmarksOnly = e.target.checked;
        renderQuestionsList();
      });
    }

    // Header Bookmarks Link (click to jump to feed with bookmarks active)
    if (elements.headerBookmarksLink) {
      elements.headerBookmarksLink.addEventListener('click', (e) => {
        e.preventDefault();
        state.bookmarksOnly = true;
        if (elements.bookmarksFilterToggle) {
          elements.bookmarksFilterToggle.checked = true;
        }
        renderQuestionsList();
        document.getElementById('feed-section')?.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Clear filters button in empty state
    if (elements.clearFiltersBtn) {
      elements.clearFiltersBtn.addEventListener('click', () => {
        state.currentCategory = 'all';
        state.searchQuery = '';
        state.bookmarksOnly = false;
        if (elements.searchInput) elements.searchInput.value = '';
        if (elements.bookmarksFilterToggle) elements.bookmarksFilterToggle.checked = false;
        renderCategoryPills();
        renderQuestionsList();
      });
    }
  }

  /**
   * Feedback and Contact Form Validation & Submission
   */
  function initFeedbackForm() {
    if (!elements.feedbackForm) return;

    elements.feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;
      const name = elements.fbNameInput.value.trim();
      const email = elements.fbEmailInput.value.trim();
      const category = elements.fbCategorySelect.value;
      const message = elements.fbMessageInput.value.trim();

      // Reset previous error classes
      [elements.fbNameInput, elements.fbEmailInput, elements.fbMessageInput].forEach((input) => {
        input.classList.remove('input-error');
        const errEl = document.getElementById(`${input.id}-error`);
        if (errEl) errEl.textContent = '';
      });

      // Name validation
      if (!name || name.length < 2) {
        showFieldError(elements.fbNameInput, 'Please enter a valid name (at least 2 characters).');
        isValid = false;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        showFieldError(elements.fbEmailInput, 'Please enter a valid email address.');
        isValid = false;
      }

      // Message validation
      if (!message || message.length < 10) {
        showFieldError(elements.fbMessageInput, 'Message must be at least 10 characters.');
        isValid = false;
      }

      if (!isValid) {
        window.MiniAskUtils.showToast('Please fix the errors in the form', 'warning', 2500);
        return;
      }

      // Save submission to LocalStorage
      window.MiniAskStorage.saveFeedback({
        name,
        email,
        category,
        message
      });

      // Show success feedback
      if (elements.fbSuccessNotice) {
        elements.fbSuccessNotice.style.display = 'block';
        setTimeout(() => {
          elements.fbSuccessNotice.style.display = 'none';
        }, 5000);
      }

      elements.feedbackForm.reset();
      window.MiniAskUtils.showToast('Thank you! Your feedback has been saved locally.', 'success', 3500);
    });
  }

  function showFieldError(inputEl, msg) {
    inputEl.classList.add('input-error');
    const errEl = document.getElementById(`${inputEl.id}-error`);
    if (errEl) {
      errEl.textContent = msg;
    }
  }

  /**
   * Mobile Hamburger Menu
   */
  function initMobileMenu() {
    if (!elements.mobileMenuBtn || !elements.navMenu) return;

    elements.mobileMenuBtn.addEventListener('click', () => {
      const isOpen = elements.navMenu.classList.toggle('nav-open');
      elements.mobileMenuBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close when clicking nav link
    elements.navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        elements.navMenu.classList.remove('nav-open');
        elements.mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /**
   * Demo Data Reset
   */
  function initDataReset() {
    if (!elements.resetDataBtn) return;

    elements.resetDataBtn.addEventListener('click', () => {
      if (confirm('Reset community questions, bookmarks, and votes back to default demo seeds?')) {
        window.MiniAskStorage.resetAllData();
        initData();
        state.currentCategory = 'all';
        state.searchQuery = '';
        state.bookmarksOnly = false;
        state.expandedCardIds.clear();

        if (elements.searchInput) elements.searchInput.value = '';
        if (elements.bookmarksFilterToggle) elements.bookmarksFilterToggle.checked = false;

        renderCategoryPills();
        renderQuestionsList();
        updateBookmarksCounter();
        window.MiniAskUtils.showToast('Demo data restored successfully!', 'info', 2500);
      }
    });
  }

  /**
   * Boot the application
   */
  function init() {
    cacheElements();
    initTheme();
    initData();
    renderCategoryPills();
    renderTrendingChips();
    renderQuestionsList();
    updateBookmarksCounter();
    initAskSection();
    initFeedControls();
    initFeedbackForm();
    initMobileMenu();
    initDataReset();
    window.MiniAskMainLoaded = true;
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
