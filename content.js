// 豆包对话搜索 - 内容脚本

(function () {
  'use strict';

  // 防止重复注入
  if (window.__doubaoSearchInjected) return;
  window.__doubaoSearchInjected = true;

  // 当前激活的 Tab
  let activeTab = 'search';

  // 搜索面板 HTML（新增 Tab 结构）
  const SEARCH_PANEL_HTML = `
    <div id="doubao-search-container">
      <div id="doubao-search-header">
        <h3>豆包对话记录</h3>
        <button id="doubao-search-close" title="关闭">×</button>
      </div>
      <div id="doubao-search-tabs">
        <button class="search-tab active" data-tab="search">搜索</button>
        <button class="search-tab" data-tab="toc">目录</button>
      </div>
      <div id="doubao-search-panel">
        <div id="doubao-search-content">
          <div id="doubao-search-input-container">
            <input 
              type="text" 
              id="doubao-search-input" 
              placeholder="输入关键词搜索对话记录..."
            />
            <button id="doubao-search-btn">搜索</button>
          </div>
          <div id="doubao-search-scope">
            <label>
              <input type="radio" name="search-scope" value="current" checked />
              当前对话
            </label>
            <label>
              <input type="radio" name="search-scope" value="all" />
              全部对话
            </label>
          </div>
          <div id="doubao-search-stats"></div>
          <div id="doubao-search-results"></div>
        </div>
        <div id="doubao-toc-content" style="display: none;">
          <div id="doubao-toc-header">
            <span id="doubao-toc-count"></span>
            <button id="doubao-toc-refresh" title="刷新目录">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
            </button>
          </div>
          <div id="doubao-toc-list"></div>
        </div>
      </div>
    </div>
  `;

  // 浮动按钮 HTML
  const FLOAT_BUTTON_HTML = `
    <button id="doubao-search-float-btn" title="搜索聊天记录 / 查看目录">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
    </button>
  `;

  // 初始化
  function init() {
    createFloatButton();
    bindFloatButton();
    observeChatChanges();
  }

  // 创建浮动按钮
  function createFloatButton() {
    const container = document.createElement('div');
    container.innerHTML = FLOAT_BUTTON_HTML;
    document.body.appendChild(container.firstElementChild);
  }

  // 绑定浮动按钮事件
  function bindFloatButton() {
    const btn = document.getElementById('doubao-search-float-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const existingPanel = document.getElementById('doubao-search-container');
      if (existingPanel) {
        existingPanel.remove();
      } else {
        createSearchPanel();
      }
    });
  }

  // 创建搜索面板
  function createSearchPanel() {
    const existing = document.getElementById('doubao-search-container');
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.innerHTML = SEARCH_PANEL_HTML;
    document.body.appendChild(panel.firstElementChild);

    const searchPanel = document.getElementById('doubao-search-container');

    // 绑定关闭按钮
    document.getElementById('doubao-search-close').addEventListener('click', () => {
      searchPanel.remove();
    });

    // 绑定 Tab 切换
    document.querySelectorAll('.search-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        switchTab(e.target.dataset.tab);
      });
    });

    // 绑定搜索按钮
    document.getElementById('doubao-search-btn').addEventListener('click', performSearch);

    // 绑定回车键搜索
    document.getElementById('doubao-search-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    });

    // 实时搜索
    document.getElementById('doubao-search-input').addEventListener('input', debounce(performSearch, 300));

    // 绑定目录刷新按钮
    document.getElementById('doubao-toc-refresh').addEventListener('click', refreshTOC);

    // 聚焦输入框
    document.getElementById('doubao-search-input').focus();

    // 如果是目录 Tab，加载目录
    if (activeTab === 'toc') {
      refreshTOC();
    }
  }

  // Tab 切换
  function switchTab(tabName) {
    activeTab = tabName;

    // 更新 Tab 按钮状态
    document.querySelectorAll('.search-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // 切换内容显示
    const searchContent = document.getElementById('doubao-search-content');
    const tocContent = document.getElementById('doubao-toc-content');

    if (tabName === 'search') {
      searchContent.style.display = 'block';
      tocContent.style.display = 'none';
      document.getElementById('doubao-search-input').focus();
    } else {
      searchContent.style.display = 'none';
      tocContent.style.display = 'block';
      refreshTOC();
    }
  }

  // 执行搜索
  async function performSearch() {
    const query = document.getElementById('doubao-search-input').value.trim();
    const resultsContainer = document.getElementById('doubao-search-results');
    const statsContainer = document.getElementById('doubao-search-stats');
    const searchScope = document.querySelector('input[name="search-scope"]:checked')?.value || 'current';

    if (!query) {
      resultsContainer.innerHTML = '<div class="search-empty">请输入搜索关键词</div>';
      statsContainer.textContent = '';
      clearHighlights();
      return;
    }

    if (searchScope === 'current') {
      // 只搜索当前对话
      statsContainer.textContent = '正在加载对话内容...';
      resultsContainer.innerHTML = '<div class="search-empty">正在加载历史消息，请稍候...</div>';

      await loadAllMessages();

      const messages = extractChatMessages();
      if (messages.length === 0) {
        resultsContainer.innerHTML = '<div class="search-empty">未找到聊天记录</div>';
        statsContainer.textContent = '';
        return;
      }

      const results = searchMessages(messages, query);
      statsContainer.textContent = `当前对话：找到 ${results.length} 条结果（共 ${messages.length} 条消息）`;

      if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="search-empty">未找到匹配的消息</div>';
        clearHighlights();
        return;
      }

      displayResults(results, query);
      highlightInPage(results, query);
    } else {
      // 搜索全部对话
      await searchAllConversations(query, resultsContainer, statsContainer);
    }
  }

  // 搜索全部对话
  async function searchAllConversations(query, resultsContainer, statsContainer) {
    statsContainer.textContent = '正在获取对话列表...';
    resultsContainer.innerHTML = '<div class="search-empty">正在扫描全部对话...</div>';

    const conversations = getConversationList();
    if (conversations.length === 0) {
      resultsContainer.innerHTML = '<div class="search-empty">未找到对话列表，请确保左侧有对话</div>';
      statsContainer.textContent = '';
      return;
    }

    statsContainer.textContent = `共 ${conversations.length} 个对话，开始搜索...`;
    let totalResults = [];
    let processedCount = 0;
    const currentConvId = getCurrentConversationId();

    for (const conv of conversations) {
      processedCount++;
      statsContainer.textContent = `正在搜索 (${processedCount}/${conversations.length})：${conv.title}`;

      try {
        if (conv.id !== currentConvId) {
          await switchToConversation(conv);
          await sleep(800);
          await loadAllMessages();
        }

        const messages = extractChatMessages();
        const results = searchMessages(messages, query);

        if (results.length > 0) {
          totalResults.push({
            conversationId: conv.id,
            conversationTitle: conv.title,
            results: results
          });
        }
      } catch (e) {
        console.error(`搜索对话 ${conv.title} 失败:`, e);
      }

      await sleep(200);
    }

    displayAllSearchResults(totalResults, query, resultsContainer, statsContainer);

    // 返回原对话
    if (currentConvId) {
      const currentConv = conversations.find(c => c.id === currentConvId);
      if (currentConv) {
        await switchToConversation(currentConv);
      }
    }
  }

  // 显示全部搜索结果
  function displayAllSearchResults(allResults, query, resultsContainer, statsContainer) {
    resultsContainer.innerHTML = '';
    let totalCount = 0;
    allResults.forEach(g => totalCount += g.results.length);
    statsContainer.textContent = `全部对话：找到 ${totalCount} 条结果（${allResults.length} 个对话）`;

    if (totalCount === 0) {
      resultsContainer.innerHTML = '<div class="search-empty">未找到匹配的消息</div>';
      return;
    }

    allResults.forEach(group => {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'search-result-group';
      groupDiv.innerHTML = `<div class="search-result-group-title">${escapeHtml(group.conversationTitle)} (${group.results.length})</div>`;

      group.results.forEach(result => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        const sender = result.sender === 'user' ? '你' : '豆包';
        const start = Math.max(0, result.matchIndex - 40);
        const end = Math.min(result.text.length, result.matchIndex + result.matchLength + 40);
        let text = result.text.substring(start, end);
        if (start > 0) text = '...' + text;
        if (end < result.text.length) text = text + '...';

        item.innerHTML = `
          <div class="search-result-header"><span class="search-result-sender">${sender}</span></div>
          <div class="search-result-text">${highlightText(text, query)}</div>
        `;
        item.addEventListener('click', async () => {
          await switchToConversationById(group.conversationId);
          await sleep(500);
          scrollToMessage(result.element);
        });
        groupDiv.appendChild(item);
      });

      resultsContainer.appendChild(groupDiv);
    });
  }

  // 获取当前对话 ID
  function getCurrentConversationId() {
    const urlMatch = window.location.href.match(/chat\/(\d+)/);
    return urlMatch ? urlMatch[1] : null;
  }

  // 获取对话列表
  function getConversationList() {
    const conversations = [];
    const selectors = [
      '[class*="conversation-item"]',
      '[class*="chat-item"]',
      '[class*="session-item"]',
      'nav [class*="item"]',
      'aside [class*="item"]'
    ];

    for (const sel of selectors) {
      const items = document.querySelectorAll(sel);
      if (items.length > 0) {
        items.forEach(item => {
          const title = item.textContent?.trim().split('\n')[0] || '未命名对话';
          const id = item.dataset?.id || item.getAttribute('data-id') || title;
          if (title && title.length < 100) {
            conversations.push({ id, title, element: item });
          }
        });
        break;
      }
    }
    return conversations;
  }

  // 切换到对话
  function switchToConversation(conv) {
    return new Promise(resolve => {
      if (conv.element) {
        conv.element.click();
        setTimeout(resolve, 500);
      } else resolve();
    });
  }

  async function switchToConversationById(id) {
    const convs = getConversationList();
    const conv = convs.find(c => c.id === id);
    if (conv) await switchToConversation(conv);
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // 自动滚动加载全部消息
  function loadAllMessages() {
    return new Promise((resolve) => {
      const scrollContainer = document.querySelector('[class*="chat"]') || 
                             document.querySelector('[class*="message"]') ||
                             document.documentElement;
      
      let lastHeight = 0;
      let retryCount = 0;
      const maxRetries = 50; // 最多尝试 50 次
      const retryDelay = 500; // 每次等待 500ms

      function scrollToBottom() {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
        window.scrollTo(0, document.body.scrollHeight);
      }

      function checkLoaded() {
        const currentHeight = document.body.scrollHeight;
        
        if (currentHeight === lastHeight) {
          // 高度没有变化，可能已经加载完毕
          retryCount++;
          if (retryCount >= 5) {
            // 连续 5 次高度不变，认为加载完成
            console.log('[豆包搜索] 全部消息加载完成');
            resolve();
            return;
          }
        } else {
          // 高度变化了，重置计数
          retryCount = 0;
          lastHeight = currentHeight;
        }

        if (retryCount < maxRetries) {
          scrollToBottom();
          setTimeout(checkLoaded, retryDelay);
        } else {
          // 超过最大尝试次数，强制结束
          console.log('[豆包搜索] 达到最大加载次数');
          resolve();
        }
      }

      // 开始滚动
      scrollToBottom();
      setTimeout(checkLoaded, retryDelay);
    });
  }

  // 提取聊天消息
  function extractChatMessages() {
    const messages = [];

    // 尝试多种选择器来匹配豆包的聊天消息
    const selectors = [
      // 用户消息
      '[class*="user-message"]',
      '[class*="UserMessage"]',
      '[class*="user"]',
      // AI 消息
      '[class*="ai-message"]',
      '[class*="AIMessage"]',
      '[class*="assistant"]',
      '[class*="bot"]',
      // 通用消息容器
      '[class*="message-item"]',
      '[class*="MessageItem"]',
      '[class*="chat-message"]',
      // 可能的段落选择器
      '[class*="content"]',
      '[class*="text"]',
    ];

    // 收集所有可能的消息元素
    let messageElements = [];

    // 首先尝试找到聊天容器
    const chatContainers = document.querySelectorAll(
      '[class*="chat"], [class*="message-list"], [class*="conversation"]'
    );

    if (chatContainers.length > 0) {
      chatContainers.forEach(container => {
        selectors.forEach(selector => {
          const elements = container.querySelectorAll(selector);
          elements.forEach(el => {
            if (!messageElements.includes(el)) {
              messageElements.push(el);
            }
          });
        });
      });
    }

    // 如果没找到，尝试在整个页面中查找
    if (messageElements.length === 0) {
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => messageElements.push(el));
      });
    }

    // 提取文本内容
    messageElements.forEach((el, index) => {
      const text = el.textContent?.trim();
      if (text && text.length > 0) {
        messages.push({
          index,
          text,
          element: el,
          timestamp: extractTimestamp(el),
          sender: detectSender(el)
        });
      }
    });

    return messages;
  }

  // 提取时间戳（如果存在）
  function extractTimestamp(element) {
    const timeSelectors = ['time', '[class*="time"]', '[class*="date"]', '[class*="timestamp"]'];
    for (const selector of timeSelectors) {
      const timeEl = element.querySelector(selector) || element.closest(selector);
      if (timeEl) {
        return timeEl.textContent?.trim() || timeEl.getAttribute('datetime') || '';
      }
    }
    return '';
  }

  // 检测发送者
  function detectSender(element) {
    const className = element.className || '';
    if (className.includes('user') || className.includes('User')) {
      return 'user';
    }
    if (className.includes('ai') || className.includes('AI') || 
        className.includes('assistant') || className.includes('bot')) {
      return 'ai';
    }
    return 'unknown';
  }

  // 搜索消息
  function searchMessages(messages, query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    messages.forEach(msg => {
      const lowerText = msg.text.toLowerCase();
      const matchIndex = lowerText.indexOf(lowerQuery);
      
      if (matchIndex !== -1) {
        results.push({
          ...msg,
          matchIndex,
          matchLength: query.length
        });
      }
    });

    return results;
  }

  // 显示搜索结果
  function displayResults(results, query) {
    const container = document.getElementById('doubao-search-results');
    container.innerHTML = '';

    results.forEach((result, idx) => {
      const resultItem = document.createElement('div');
      resultItem.className = 'search-result-item';

      const sender = result.sender === 'user' ? '你' : '豆包';
      const timeStr = result.timestamp ? `<span class="search-result-time">${result.timestamp}</span>` : '';

      const contextStart = Math.max(0, result.matchIndex - 50);
      const contextEnd = Math.min(result.text.length, result.matchIndex + result.matchLength + 50);
      let contextText = result.text.substring(contextStart, contextEnd);

      if (contextStart > 0) contextText = '...' + contextText;
      if (contextEnd < result.text.length) contextText = contextText + '...';

      const highlightedText = highlightText(contextText, query);

      resultItem.innerHTML = `
        <div class="search-result-header">
          <span class="search-result-sender">${sender}</span>
          ${timeStr}
        </div>
        <div class="search-result-text">${highlightedText}</div>
      `;

      resultItem.addEventListener('click', () => {
        scrollToMessage(result.element);
      });

      container.appendChild(resultItem);
    });
  }

  // 高亮文本
  function highlightText(text, query) {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    return text.replace(regex, match => `<mark class="search-highlight">${match}</mark>`);
  }

  // 在页面中高亮匹配的关键字
  function highlightInPage(results, query) {
    clearHighlights();

    results.forEach(result => {
      // 获取消息内容元素
      const contentEl = result.element.querySelector("[data-render-engine='node']") || 
                       result.element.querySelector("[class*='content']") ||
                       result.element;
      
      if (contentEl && query) {
        highlightKeywordInElement(contentEl, query);
      }
    });
  }

  // 在元素内高亮关键字
  function highlightKeywordInElement(element, query) {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    
    // 遍历所有文本节点
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }
    
    textNodes.forEach(textNode => {
      if (regex.test(textNode.textContent)) {
        const span = document.createElement('span');
        span.innerHTML = textNode.textContent.replace(regex, '<mark class="search-highlight-keyword">$&</mark>');
        textNode.parentNode.replaceChild(span, textNode);
      }
    });
  }

  // 清除高亮
  function clearHighlights() {
    // 清除消息背景高亮
    document.querySelectorAll('.doubao-search-highlight').forEach(el => {
      el.classList.remove('doubao-search-highlight');
    });
    document.querySelectorAll('.doubao-search-highlight-active').forEach(el => {
      el.classList.remove('doubao-search-highlight-active');
    });
    
    // 清除关键字高亮标记，恢复原文本
    // 使用 while 循环确保清除所有标记
    let marks = document.querySelectorAll('.search-highlight-keyword');
    while (marks.length > 0) {
      marks.forEach(mark => {
        const parent = mark.parentNode;
        const textNode = document.createTextNode(mark.textContent);
        parent.replaceChild(textNode, mark);
        parent.normalize();
      });
      // 重新查询，因为 DOM 已改变
      marks = document.querySelectorAll('.search-highlight-keyword');
    }
  }

  // 滚动到消息并高亮
  function scrollToMessage(element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.classList.add('doubao-search-highlight-active');
    setTimeout(() => {
      element.classList.remove('doubao-search-highlight-active');
    }, 3000);
  }

  // 刷新目录
  async function refreshTOC() {
    const tocCount = document.getElementById('doubao-toc-count');
    if (tocCount) {
      tocCount.textContent = '正在加载...';
    }
    
    // 自动滚动加载全部对话
    await loadAllMessages();
    
    const questions = extractUserQuestions();
    renderTOC(questions);
  }

  // 提取用户提问（优化版 - 参考 doubao-enhance-mini）
  function extractUserQuestions() {
    const questions = [];
    
    // 使用 doubao-enhance-mini 的选择器
    const userMessageElements = document.querySelectorAll("[data-foundation-type='send-message-action-bar']");
    
    userMessageElements.forEach((actionBar, index) => {
      let msgContainer = actionBar.parentElement;
      
      // 向上查找包含消息内容的容器
      for (let i = 0; i < 5; i++) {
        if (!msgContainer) break;
        
        const contentEl = msgContainer.querySelector("[data-render-engine='node']") || 
                         msgContainer.querySelector(".message-content--user") ||
                         msgContainer.querySelector("[class*='content']");
        
        if (contentEl) {
          const text = contentEl.innerText.trim();
          if (text) {
            questions.push({
              index: index,
              element: msgContainer,
              text: text,
              timestamp: ''
            });
          }
          break;
        }
        msgContainer = msgContainer.parentElement;
      }
    });

    // 如果没找到，使用备选选择器
    if (questions.length === 0) {
      const messages = extractChatMessages();
      return messages.filter(msg => msg.sender === 'user');
    }

    return questions;
  }

  // 渲染目录（优化版）
  function renderTOC(questions) {
    const tocList = document.getElementById('doubao-toc-list');
    const tocCount = document.getElementById('doubao-toc-count');

    tocCount.textContent = `共 ${questions.length} 个提问`;

    if (questions.length === 0) {
      tocList.innerHTML = '<div class="search-empty">未找到用户提问</div>';
      return;
    }

    tocList.innerHTML = '';

    questions.forEach((question, index) => {
      const item = document.createElement('div');
      item.className = 'toc-item';

      // 截取前 20 个字作为标题（与 doubao-enhance-mini 一致）
      const title = question.text.length > 20 
        ? question.text.substring(0, 20) + '...' 
        : question.text;

      item.innerHTML = `
        <div class="toc-item-index">${index + 1}</div>
        <div class="toc-item-content">
          <div class="toc-item-title" title="${escapeHtml(question.text)}">${escapeHtml(title)}</div>
        </div>
      `;

      item.addEventListener('click', () => {
        // 滚动到对应消息（block: 'start' 让消息显示在顶部）
        question.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // 高亮显示
        question.element.classList.add('doubao-search-highlight-active');
        setTimeout(() => {
          question.element.classList.remove('doubao-search-highlight-active');
        }, 2000);
      });

      tocList.appendChild(item);
    });
  }

  // HTML 转义
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 监听聊天内容变化
  function observeChatChanges() {
    let updateTimeout = null;

    const observer = new MutationObserver((mutations) => {
      // 当聊天内容变化时，自动更新目录（如果目录面板已打开）
      const tocContent = document.getElementById('doubao-toc-content');
      if (tocContent && tocContent.style.display !== 'none') {
        // 防抖更新
        if (updateTimeout) clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
          refreshTOC();
        }, 1000);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // 防抖函数
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
