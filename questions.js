/**
 * MiniAsk — Questions & Demo Answer Engine Module
 * Contains default community Q&A seeds, trending suggestions, and the extensible
 * offline heuristic rule-based answer generation engine.
 *
 * NOTE: As required, this does NOT use external AI APIs or cloud models.
 * All answers are generated deterministically using transparent heuristics.
 */

(function (window) {
  'use strict';

  const SEED_QUESTIONS = [
    {
      id: 'q_seed_1',
      title: 'TypeError: unsupported operand type(s) for +=: \'int\' and \'str\' in Python',
      author: 'Alex Dev',
      authorRole: 'Software Engineer',
      avatarInitial: 'A',
      category: 'python',
      categoryLabel: 'Python & APIs',
      tags: ['python', 'typeerror', 'data-types', 'debugging'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
      views: 342,
      upvotes: 48,
      downvotes: 1,
      isAnswered: true,
      questionBody: 'I have a function calculating total items, but it throws: TypeError: unsupported operand type(s) for +=: \'int\' and \'str\'. Why does this happen when one item price is loaded from json?',
      codeSnippet: `def calculate_total(items):\n    total = 0\n    for item in items:\n        total += item.price  # Throws TypeError\n    return total`,
      snippetLang: 'python',
      answer: {
        summary: 'One or more items has a string value (e.g. "24.99") instead of a float/integer, causing Python to reject numeric addition.',
        explanation: 'In Python, the `+=` operator cannot implicitly cast a string into a number. When reading from JSON or APIs, numbers frequently arrive as strings. You must explicitly cast `item.price` to `float()` or validate the numeric type before performing arithmetic.',
        solutionCode: `def calculate_total(items):\n    total = 0.0\n    for item in items:\n        # Explicitly convert to float to prevent TypeError\n        price = float(item.price) if hasattr(item, 'price') else 0.0\n        total += price\n    return round(total, 2)`,
        solutionLang: 'python',
        engineLabel: 'MiniAsk Heuristic Engine (Offline Rule Matcher)',
        answeredAt: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString()
      }
    },
    {
      id: 'q_seed_2',
      title: 'How does MiniAsk protect private API tokens and passwords before asking AI?',
      author: 'Elena Rostova',
      authorRole: 'Security Researcher',
      avatarInitial: 'E',
      category: 'security',
      categoryLabel: 'Security & Privacy',
      tags: ['privacy', 'redaction', 'security', 'zero-trust'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
      views: 521,
      upvotes: 76,
      downvotes: 0,
      isAnswered: true,
      questionBody: 'Does MiniAsk send entire screens or active buffers to external servers? How are credentials sanitized before any data leaves the local machine?',
      codeSnippet: `// Example sensitive snippet detected in code buffer:\nconst apiKey = "sk-proj-999384729104847201948";\nconst dbPassword = "SuperSecretPassword123!";`,
      snippetLang: 'javascript',
      answer: {
        summary: 'MiniAsk operates on an explicit-request boundary with local regex and AST sanitization before any network request is allowed.',
        explanation: 'Unlike background monitor tools, MiniAsk triggers ONLY when explicitly invoked (e.g. clicking or pressing Alt+Space). Captured context is parsed in memory through local pattern matchers for OpenAI keys, AWS keys, JWTs, emails, and passwords, replacing them with [REDACTED_SECRET]. The user must review and click "Approve" before anything is sent.',
        solutionCode: `// Local Redaction Pipeline Concept (Pure Client/Local):\nfunction sanitizeText(raw) {\n  return raw\n    .replace(/sk-[a-zA-Z0-9_-]{20,}/g, '[REDACTED_API_KEY]')\n    .replace(/ghp_[a-zA-Z0-9]{36}/g, '[REDACTED_GITHUB_PAT]')\n    .replace(/bearer\\s+[a-zA-Z0-9\\._-]+/gi, 'Bearer [REDACTED_TOKEN]');\n}`,
        solutionLang: 'javascript',
        engineLabel: 'MiniAsk Heuristic Engine (Offline Architecture Spec)',
        answeredAt: new Date(Date.now() - 1000 * 60 * 60 * 7.5).toISOString()
      }
    },
    {
      id: 'q_seed_3',
      title: 'How to fix CORS errors when calling local APIs from a browser frontend?',
      author: 'Marcus Chen',
      authorRole: 'Frontend Developer',
      avatarInitial: 'M',
      category: 'frontend',
      categoryLabel: 'Frontend (HTML/CSS/JS)',
      tags: ['cors', 'javascript', 'fetch', 'browsers'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      views: 412,
      upvotes: 35,
      downvotes: 2,
      isAnswered: true,
      questionBody: 'Getting: "Access to fetch at http://localhost:8000 from origin http://localhost:3000 has been blocked by CORS policy: No \'Access-Control-Allow-Origin\' header". How do I fix this?',
      codeSnippet: `fetch('http://localhost:8000/api/data')\n  .then(res => res.json())\n  .catch(err => console.error(err));`,
      snippetLang: 'javascript',
      answer: {
        summary: 'CORS is a browser security mechanism. The backend server must return the appropriate Access-Control-Allow-Origin response header.',
        explanation: 'Browsers block cross-origin HTTP requests unless the server gives permission. The fix MUST be made on the server or via a local proxy, not in the client fetch call.',
        solutionCode: `// In Python FastAPI backend:\nfrom fastapi.middleware.cors import CORSMiddleware\n\napp.add_middleware(\n    CORSMiddleware,\n    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],\n    allow_credentials=True,\n    allow_methods=["*"],\n    allow_headers=["*"],\n)`,
        solutionLang: 'python',
        engineLabel: 'MiniAsk Heuristic Engine (Offline Rule Matcher)',
        answeredAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString()
      }
    },
    {
      id: 'q_seed_4',
      title: 'How to center a div horizontally and vertically using modern pure CSS?',
      author: 'Priya Sharma',
      authorRole: 'UI/UX Developer',
      avatarInitial: 'P',
      category: 'frontend',
      categoryLabel: 'Frontend (HTML/CSS/JS)',
      tags: ['css', 'flexbox', 'centering', 'layouts'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      views: 610,
      upvotes: 52,
      downvotes: 0,
      isAnswered: true,
      questionBody: 'What is the cleanest modern CSS way to center a container both vertically and horizontally across all browser sizes without hacky absolute coordinates?',
      codeSnippet: `<div class="parent">\n  <div class="child">Centered Content</div>\n</div>`,
      snippetLang: 'html',
      answer: {
        summary: 'Use Flexbox with `justify-content: center` and `align-items: center`, or CSS Grid with `place-items: center`.',
        explanation: 'Both methods are fully responsive and supported in all modern browsers without requiring fixed margins or pixel coordinates.',
        solutionCode: `/* Method A: CSS Flexbox */\n.parent-flex {\n  display: flex;\n  justify-content: center; /* Horizontal */\n  align-items: center;     /* Vertical */\n  min-height: 100vh;\n}\n\n/* Method B: CSS Grid (Shortest) */\n.parent-grid {\n  display: grid;\n  place-items: center;\n  min-height: 100vh;\n}`,
        solutionLang: 'css',
        engineLabel: 'MiniAsk Heuristic Engine (Offline Rule Matcher)',
        answeredAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
      }
    },
    {
      id: 'q_seed_5',
      title: 'How to run local LLMs with Ollama for offline privacy-first Q&A?',
      author: 'David Kim',
      authorRole: 'DevOps Engineer',
      avatarInitial: 'D',
      category: 'security',
      categoryLabel: 'Security & Privacy',
      tags: ['ollama', 'local-llm', 'privacy', 'offline'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 38).toISOString(),
      views: 298,
      upvotes: 39,
      downvotes: 1,
      isAnswered: true,
      questionBody: 'How do I run a local model like Llama 3 via Ollama so that MiniAsk can query it without sending any packets to third-party cloud servers?',
      codeSnippet: `# Terminal command:\nollama pull llama3\nollama serve`,
      snippetLang: 'bash',
      answer: {
        summary: 'Install Ollama locally, pull your chosen open-weights model, and query Ollama at http://localhost:11434/api/generate.',
        explanation: 'Ollama runs entirely on your local machine using your GPU/CPU. When MiniAsk targets `http://localhost:11434`, zero tokens are sent across the public internet, ensuring total privacy.',
        solutionCode: `# 1. Pull and test the model in terminal\nollama run llama3:latest\n\n# 2. Ollama native REST API endpoint:\n# POST http://localhost:11434/api/chat\n# {\n#   "model": "llama3",\n#   "messages": [{ "role": "user", "content": "Hello" }]\n# }`,
        solutionLang: 'bash',
        engineLabel: 'MiniAsk Heuristic Engine (Offline Rule Matcher)',
        answeredAt: new Date(Date.now() - 1000 * 60 * 60 * 35).toISOString()
      }
    },
    {
      id: 'q_seed_6',
      title: 'Handling SQLite "Database is locked" error under concurrent read/writes',
      author: 'Sarah Jenkins',
      authorRole: 'Backend Engineer',
      avatarInitial: 'S',
      category: 'backend',
      categoryLabel: 'Backend & APIs',
      tags: ['sqlite', 'database', 'concurrency', 'wal-mode'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
      views: 184,
      upvotes: 21,
      downvotes: 0,
      isAnswered: true,
      questionBody: 'Under moderate load, our local SQLite database throws: sqlite3.OperationalError: database is locked. How can we enable concurrent reads during writes?',
      codeSnippet: `import sqlite3\nconn = sqlite3.connect('app.db')\n# Throws database locked on parallel writes`,
      snippetLang: 'python',
      answer: {
        summary: 'Enable SQLite Write-Ahead Logging (WAL) mode and configure a busy timeout.',
        explanation: 'By default, SQLite uses rollback journal mode which locks the whole database during writes. In WAL mode, readers do not block writers and writers do not block readers.',
        solutionCode: `import sqlite3\n\nconn = sqlite3.connect('app.db', timeout=10.0)\n# Enable Write-Ahead Logging (WAL)\nconn.execute('PRAGMA journal_mode=WAL;')\n# Enable busy timeout (5000 milliseconds)\nconn.execute('PRAGMA busy_timeout = 5000;')`,
        solutionLang: 'python',
        engineLabel: 'MiniAsk Heuristic Engine (Offline Rule Matcher)',
        answeredAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
      }
    }
  ];

  const TRENDING_SUGGESTIONS = [
    {
      label: 'TypeError: unsupported operand += (int, str)',
      query: 'Why do I get TypeError: unsupported operand type(s) for +=: \'int\' and \'str\' in Python?',
      category: 'python'
    },
    {
      label: 'How MiniAsk protects private API tokens',
      query: 'How does MiniAsk protect private data and tokens before asking AI?',
      category: 'security'
    },
    {
      label: 'Fix CORS error in web applications',
      query: 'How to fix CORS errors when calling local APIs from browser frontend?',
      category: 'frontend'
    },
    {
      label: 'Center a div horizontally and vertically',
      query: 'How to center a div horizontally and vertically using pure CSS?',
      category: 'frontend'
    },
    {
      label: 'Run Ollama locally for 100% offline Q&A',
      query: 'How to run local LLMs with Ollama for offline privacy-first Q&A?',
      category: 'security'
    },
    {
      label: 'SQLite database is locked fix (WAL mode)',
      query: 'Handling SQLite Database is locked error under concurrent read/writes',
      category: 'backend'
    }
  ];

  const CATEGORIES = [
    { id: 'all', label: 'All Categories', icon: '✦' },
    { id: 'frontend', label: 'Frontend', icon: '🎨' },
    { id: 'backend', label: 'Backend & APIs', icon: '⚡' },
    { id: 'security', label: 'Security & Privacy', icon: '🛡️' },
    { id: 'python', label: 'Python & Data', icon: '🐍' },
    { id: 'desktop', label: 'Windows & Desktop', icon: '💻' }
  ];

  /**
   * Extensible Demo Answer Engine (Heuristic Rule Matcher)
   * Deterministic client-side analysis. No external AI APIs or cloud models are called.
   */
  const MiniAskQuestions = {
    getCategories() {
      return CATEGORIES;
    },

    getTrending() {
      return TRENDING_SUGGESTIONS;
    },

    getDefaultSeeds() {
      return JSON.parse(JSON.stringify(SEED_QUESTIONS));
    },

    /**
     * Generate an answer using pure client-side heuristic pattern matching.
     * @param {string} rawPrompt
     * @param {string} [preferredCategory]
     * @returns {Promise<Object>}
     */
    async generateDemoAnswer(rawPrompt, preferredCategory = 'all') {
      const prompt = (rawPrompt || '').toLowerCase();

      // Heuristic Rule 1: Python TypeError scenario
      if (prompt.includes('typeerror') || (prompt.includes('int') && prompt.includes('str')) || prompt.includes('unsupported operand')) {
        return {
          title: rawPrompt,
          category: 'python',
          categoryLabel: 'Python & APIs',
          summary: 'Type mismatch in arithmetic operation: Python cannot add a string to a numeric integer without explicit casting.',
          explanation: 'When parsing data from JSON, HTTP bodies, or user input, numbers often retain string formatting. Because Python does not perform implicit string coercion in arithmetic expressions, `int + str` results in a fatal `TypeError`.',
          codeSnippet: `# Heuristic Solution:\ndef sanitize_and_add(base_num, new_val):\n    try:\n        return base_num + float(new_val)\n    except (ValueError, TypeError):\n        return base_num`,
          codeLang: 'python',
          engineLabel: 'MiniAsk Heuristic Engine • Python Ruleset (Client-Side)'
        };
      }

      // Heuristic Rule 2: Privacy / Redaction / Token protection
      if (prompt.includes('privacy') || prompt.includes('redact') || prompt.includes('token') || prompt.includes('secret') || prompt.includes('password')) {
        return {
          title: rawPrompt,
          category: 'security',
          categoryLabel: 'Security & Privacy',
          summary: 'MiniAsk privacy architecture: Explicit-only capture, native client redaction, and user preview approval.',
          explanation: 'MiniAsk maintains zero continuous background monitoring. When triggered by the user, local heuristics inspect memory buffers for API keys, bearer tokens, passwords, and PII, masking them into safe tokens before any network call occurs.',
          codeSnippet: `// Client-side Sanitization Pattern:\nconst SENSITIVE_PATTERNS = [\n  { name: 'API_KEY', regex: /sk-[a-zA-Z0-9]{24,}/g },\n  { name: 'TOKEN', regex: /bearer\\s+[a-zA-Z0-9_-]+/gi }\n];`,
          codeLang: 'javascript',
          engineLabel: 'MiniAsk Heuristic Engine • Security Ruleset (Client-Side)'
        };
      }

      // Heuristic Rule 3: CORS error
      if (prompt.includes('cors') || prompt.includes('access-control') || prompt.includes('origin')) {
        return {
          title: rawPrompt,
          category: 'frontend',
          categoryLabel: 'Frontend (HTML/CSS/JS)',
          summary: 'Cross-Origin Resource Sharing (CORS) restriction enforced by browser security policy.',
          explanation: 'Browsers block client-side fetch requests when the server domain or port differs from the frontend origin, unless the server explicitly sends `Access-Control-Allow-Origin: *` or specifies the exact allowed origin in HTTP response headers.',
          codeSnippet: `// Server response header required:\n// Access-Control-Allow-Origin: *\n// Access-Control-Allow-Methods: GET, POST, OPTIONS\n// Access-Control-Allow-Headers: Content-Type, Authorization`,
          codeLang: 'http',
          engineLabel: 'MiniAsk Heuristic Engine • Web Standards Ruleset (Client-Side)'
        };
      }

      // Heuristic Rule 4: CSS Centering
      if (prompt.includes('center') || prompt.includes('centering') || prompt.includes('flexbox') || prompt.includes('div')) {
        return {
          title: rawPrompt,
          category: 'frontend',
          categoryLabel: 'Frontend (HTML/CSS/JS)',
          summary: 'Modern CSS layout standard: Center any element using Flexbox or CSS Grid.',
          explanation: 'Modern browser layouts avoid absolute position offsets. Flexbox provides flexible bidirectional alignment with `justify-content` and `align-items`, while Grid provides concise single-property alignment with `place-items: center`.',
          codeSnippet: `.centered-container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  width: 100%;\n}`,
          codeLang: 'css',
          engineLabel: 'MiniAsk Heuristic Engine • CSS Layout Ruleset (Client-Side)'
        };
      }

      // Heuristic Rule 5: Local Ollama / Offline LLM
      if (prompt.includes('ollama') || prompt.includes('local llm') || prompt.includes('offline') || prompt.includes('llama')) {
        return {
          title: rawPrompt,
          category: 'security',
          categoryLabel: 'Security & Privacy',
          summary: 'Local LLM orchestration via Ollama: zero external cloud dependencies.',
          explanation: 'Running Ollama on `localhost:11434` creates a local REST server. Developers can send prompts to local neural weights without transmitting code or proprietary context over external networks.',
          codeSnippet: `# Test local Ollama connection in terminal:\ncurl http://localhost:11434/api/generate -d '{\n  "model": "llama3",\n  "prompt": "Explain local AI privacy",\n  "stream": false\n}'`,
          codeLang: 'bash',
          engineLabel: 'MiniAsk Heuristic Engine • Offline LLM Ruleset (Client-Side)'
        };
      }

      // Heuristic Rule 6: SQLite lock
      if (prompt.includes('sqlite') || prompt.includes('lock') || prompt.includes('database is locked')) {
        return {
          title: rawPrompt,
          category: 'backend',
          categoryLabel: 'Backend & APIs',
          summary: 'SQLite lock contention resolution: Enable WAL mode and configure connection timeouts.',
          explanation: 'SQLite default locking blocks reading threads during write commits. Switching to Write-Ahead Logging (WAL) decouples concurrent readers from writers.',
          codeSnippet: `-- Execute PRAGMA commands on database connection:\nPRAGMA journal_mode=WAL;\nPRAGMA busy_timeout = 5000;\nPRAGMA synchronous = NORMAL;`,
          codeLang: 'sql',
          engineLabel: 'MiniAsk Heuristic Engine • SQLite Ruleset (Client-Side)'
        };
      }

      // Heuristic Rule 7: LocalStorage / Storage
      if (prompt.includes('localstorage') || prompt.includes('sessionstorage') || prompt.includes('storage') || prompt.includes('cache')) {
        return {
          title: rawPrompt,
          category: 'frontend',
          categoryLabel: 'Frontend (HTML/CSS/JS)',
          summary: 'Browser client-side storage architecture: LocalStorage vs SessionStorage.',
          explanation: 'LocalStorage persists across browser restarts for domain origins (typically ~5MB limit). SessionStorage expires when the tab closes. All LocalStorage calls are synchronous and store string key-value pairs.',
          codeSnippet: `// Safe LocalStorage Helper Example:\nfunction saveItem(key, data) {\n  try {\n    localStorage.setItem(key, JSON.stringify(data));\n  } catch (err) {\n    console.error('Storage quota exceeded or disabled', err);\n  }\n}`,
          codeLang: 'javascript',
          engineLabel: 'MiniAsk Heuristic Engine • Browser Storage Ruleset (Client-Side)'
        };
      }

      // Generic Heuristic Rule: Structured synthesis for arbitrary queries
      const chosenCategory = preferredCategory !== 'all' ? preferredCategory : 'frontend';
      const catMap = {
        frontend: 'Frontend (HTML/CSS/JS)',
        backend: 'Backend & APIs',
        security: 'Security & Privacy',
        python: 'Python & Data',
        desktop: 'Windows & Desktop'
      };

      return {
        title: rawPrompt,
        category: chosenCategory,
        categoryLabel: catMap[chosenCategory] || 'Developer Q&A',
        summary: `Diagnosis & heuristic evaluation for "${window.MiniAskUtils ? window.MiniAskUtils.truncate(rawPrompt, 65) : rawPrompt.slice(0, 65)}"`,
        explanation: `This response was generated by the MiniAsk Demo Heuristic Engine running locally in your browser. Heuristic pattern evaluation inspected the keywords in your query to formulate an offline guideline. For full offline customization, you can extend rule definitions directly inside frontend/js/questions.js.`,
        codeSnippet: `// Heuristic template pattern for: ${rawPrompt.replace(/[^\w\s-]/g, '')}\nfunction handleQueryResolution() {\n  const status = "resolved";\n  console.log("Validated client-side without external cloud dependencies");\n  return { status, timestamp: Date.now() };\n}`,
        codeLang: 'javascript',
        engineLabel: 'MiniAsk Demo Heuristic Engine (Offline Client Rule Evaluation)'
      };
    }
  };

  window.MiniAskQuestions = MiniAskQuestions;
})(window);
