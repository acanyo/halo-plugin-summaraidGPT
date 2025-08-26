/**
 * likcc-summaraidGPT AI摘要框
 * 动态创建AI摘要框，支持配置Logo、标题、GPT名字、打字机效果
 */

(function() {
  'use strict';

  // 防止重复初始化
  if (window.likcc_summaraidGPT_summaryInitialized) {
    return;
  }

  // 检查CSS是否已加载
  function likcc_summaraidGPT_checkCSS() {
    const linkElement = document.querySelector('link[href*="ArticleSummary.css"]');
    if (!linkElement) {
      console.warn('ArticleSummary.css 未找到，请确保CSS文件已正确引入');
    }
  }

  // 打字机效果
  function likcc_summaraidGPT_typeWriter(element, text, speed = 50) {
    return new Promise((resolve) => {
      let index = 0;
      element.innerHTML = '';

      function type() {
        if (index < text.length) {
          element.innerHTML += text.charAt(index);
          index++;
          setTimeout(type, speed);
        } else {
          // 添加闪烁光标
          const cursor = document.createElement('span');
          cursor.className = 'likcc-summaraidGPT-cursor';
          element.appendChild(cursor);
          resolve();
        }
      }

      type();
    });
  }

  // 创建摘要框HTML
  function likcc_summaraidGPT_createSummaryBoxHTML(config) {
    return `
            <div class="likcc-summaraidGPT-summary-container">
                <div class="likcc-summaraidGPT-summary-header">
                    <div class="likcc-summaraidGPT-header-left">
                        <img class="likcc-summaraidGPT-logo  not-prose" src="${config.logo || ''}" alt="AI Logo">
                        <span class="likcc-summaraidGPT-summary-title">${config.summaryTitle || 'AI摘要'}</span>
                    </div>
                    <span class="likcc-summaraidGPT-gpt-name">${config.gptName || 'LikccGPT'}</span>
                </div>
                <div class="likcc-summaraidGPT-content-area">
                    <div class="likcc-summaraidGPT-summary-content"></div>
                    <div class="likcc-summaraidGPT-recommendations hidden">
                        <ul>
                            <li><a href="#" rel="noopener">禅导航 v2 升级：彻底重构，只为更好用</a></li>
                            <li><a href="#" rel="noopener">🌿 林间第2页拾语：糟心事很少，懂你的人刚好够</a></li>
                            <li><a href="#" rel="noopener">谈谈SEO：什么是SEO，如何做好SEO，及需要注意的事项</a></li>
                        </ul>
                    </div>
                    <div class="likcc-summaraidGPT-intro hidden">
                        <h3>🤖 智阅GPT助手</h3>
                        <p>我是您的智能阅读助手，可以为您：</p>
                        <p>• 生成文章摘要，提炼核心观点</p>
                        <p>• 推荐相关文章，扩展阅读视野</p>
                        <p>• 回答文章相关问题，深入理解内容</p>
                        <p>让阅读更高效，知识更丰富！</p>
                    </div>
                    <div class="likcc-summaraidGPT-qa hidden">
                        <div class="placeholder">💭 文章问答功能开发中...</div>
                        <p>这里将支持针对文章内容的智能问答</p>
                    </div>
                </div>
                <div class="likcc-summaraidGPT-bottom-area">
                    <div class="likcc-summaraidGPT-button-group">
                        <button class="likcc-summaraidGPT-button active" data-action="summary">
                            📖 显示摘要
                        </button>
                        <button class="likcc-summaraidGPT-button" data-action="recommendations">
                            📚 推荐阅读
                        </button>
                        <button class="likcc-summaraidGPT-button" data-action="qa">
                            ❓ 文章问答
                        </button>
                        <button class="likcc-summaraidGPT-button" data-action="intro">
                            🤖 介绍自己
                        </button>
                    </div>
                    <div class="likcc-summaraidGPT-disclaimer">
                        此摘要由智阅GPT分析文章内容生成，仅供参考。
                    </div>
                </div>
            </div>
        `;
  }

  // 检查 darkSelector
  function isDarkBySelector(selector) {
    const html = document.documentElement;
    const body = document.body;
    if (!selector) return false;
    // data-xxx=yyy
    const dataAttrMatch = selector.match(/^data-([\w-]+)=(.+)$/);
    if (dataAttrMatch) {
      const attr = 'data-' + dataAttrMatch[1];
      const val = dataAttrMatch[2];
      return (
              html.getAttribute(attr) === val ||
              body.getAttribute(attr) === val
      );
    }
    // class=xxx
    const classMatch = selector.match(/^class=(.+)$/);
    if (classMatch) {
      const className = classMatch[1];
      return (
              html.classList.contains(className) ||
              body.classList.contains(className)
      );
    }
    // 直接class名
    return (
            html.classList.contains(selector) ||
            body.classList.contains(selector)
    );
  }

  // 应用自定义主题CSS变量
  function applyCustomTheme(theme, container) {
    if (!theme || typeof theme !== 'object') return;

    // 直接在容器元素上设置CSS变量，避免全局污染
    if (theme.bg) container.style.setProperty('--likcc-summaraid-bg', theme.bg);
    if (theme.main) container.style.setProperty('--likcc-summaraid-main', theme.main);
    if (theme.contentFontSize) container.style.setProperty('--likcc-summaraid-contentFontSize', theme.contentFontSize);
    if (theme.title) container.style.setProperty('--likcc-summaraid-title', theme.title);
    if (theme.content) container.style.setProperty('--likcc-summaraid-content', theme.content);
    if (theme.gptName) container.style.setProperty('--likcc-summaraid-gptName', theme.gptName);
    if (theme.contentBg) container.style.setProperty('--likcc-summaraid-contentBg', theme.contentBg);
    if (theme.border) container.style.setProperty('--likcc-summaraid-border', theme.border);
    if (theme.shadow) container.style.setProperty('--likcc-summaraid-shadow', theme.shadow);
    if (theme.tagBg) container.style.setProperty('--likcc-summaraid-tagBg', theme.tagBg);
    if (theme.cursor) container.style.setProperty('--likcc-summaraid-cursor', theme.cursor);
  }

  // 公共主题切换函数
  function updateSummaryTheme(isDark) {
    document.querySelectorAll('.likcc-summaraidGPT-summary-container').forEach(container => {
      container.classList.remove(
              'likcc-summaraidGPT-summary--dark',
              'likcc-summaraidGPT-summary--blue',
              'likcc-summaraidGPT-summary--green',
              'likcc-summaraidGPT-summary--default',
              'likcc-summaraidGPT-summary--custom'
      );
      container.classList.add(isDark ? 'likcc-summaraidGPT-summary--dark' : 'likcc-summaraidGPT-summary--default');
    });
  }

  function observeDarkSelector(selector) {
    const html = document.documentElement;
    const body = document.body;
    if (!selector) return;

    const dataAttrMatch = selector.match(/^data-([\w-]+)=(.+)$/);
    const classMatch = selector.match(/^class=(.+)$/);

    let checkIsDark;
    let obsConfig = { attributes: true, attributeFilter: ['class'] };

    if (dataAttrMatch) {
      const attr = 'data-' + dataAttrMatch[1];
      const val = dataAttrMatch[2];
      checkIsDark = () => (html.getAttribute(attr) === val || body.getAttribute(attr) === val);
      obsConfig.attributeFilter.push(attr);
    } else if (classMatch) {
      const className = classMatch[1];
      checkIsDark = () => (html.classList.contains(className) || body.classList.contains(className));
    } else {
      const className = selector;
      checkIsDark = () => (html.classList.contains(className) || body.classList.contains(className));
    }

    const callback = () => updateSummaryTheme(checkIsDark());

    new MutationObserver(callback).observe(html, obsConfig);
    new MutationObserver(callback).observe(body, obsConfig);
    callback(); // 保证初始状态
  }

  // 通过API获取摘要内容
  function fetchSummaryContent(permalink, contentElement, config) {
    const apiUrl = `/apis/api.summary.summaraidgpt.lik.cc/v1alpha1/updateContent`;
    // 将permalink中的/替换为__以适配API
    const encodedPermalink = permalink.replace(/\//g, '__');

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: encodedPermalink
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      const content = data.summaryContent || '暂无摘要内容';
      if (config.typewriter) {
        likcc_summaraidGPT_typeWriter(contentElement, content, config.typeSpeed);
      } else {
        contentElement.innerHTML = content;
      }
    })
    .catch(error => {
      console.warn('获取摘要失败:', error);
      contentElement.innerHTML = '摘要加载失败，请稍后重试';
    });
  }

  // 按钮交互处理
  function likcc_summaraidGPT_handleButtonClick(action, container) {
    const contentArea = container.querySelector('.likcc-summaraidGPT-content-area');
    const buttons = container.querySelectorAll('.likcc-summaraidGPT-button');
    const summaryContent = contentArea.querySelector('.likcc-summaraidGPT-summary-content');
    const recommendations = contentArea.querySelector('.likcc-summaraidGPT-recommendations');
    const intro = contentArea.querySelector('.likcc-summaraidGPT-intro');
    const qa = contentArea.querySelector('.likcc-summaraidGPT-qa');

    // 移除所有按钮的active状态
    buttons.forEach(btn => btn.classList.remove('active'));

    // 隐藏所有内容区域
    [summaryContent, recommendations, intro, qa].forEach(el => {
      if (el) el.classList.add('hidden');
    });

    // 根据action显示对应内容
    switch (action) {
      case 'summary':
        summaryContent.classList.remove('hidden');
        buttons[0].classList.add('active');
        break;
      case 'recommendations':
        recommendations.classList.remove('hidden');
        buttons[1].classList.add('active');
        break;
      case 'qa':
        qa.classList.remove('hidden');
        buttons[2].classList.add('active');
        break;
      case 'intro':
        intro.classList.remove('hidden');
        buttons[3].classList.add('active');
        break;
    }
  }

  // 初始化按钮事件
  function likcc_summaraidGPT_initButtons(container) {
    const buttons = container.querySelectorAll('.likcc-summaraidGPT-button');
    buttons.forEach(button => {
      button.addEventListener('click', function() {
        const action = this.getAttribute('data-action');
        likcc_summaraidGPT_handleButtonClick(action, container);
      });
    });
  }

  // 主初始化函数
  window.likcc_summaraidGPT_initSummaryBox = function(config) {
    likcc_summaraidGPT_checkCSS();

    // 严格白名单判断，支持 * 结尾做前缀匹配
    if (typeof config.whitelist !== 'string' || config.whitelist.length === 0) {
      return null;
    }
    var path = window.location.pathname;
    if (config.whitelist.endsWith('*')) {
      // 通配符前缀匹配
      var prefix = config.whitelist.slice(0, -1);
      if (!path.startsWith(prefix)) {
        return null;
      }
    } else {
      if (path.indexOf(config.whitelist) === -1) {
        return null;
      }
    }

    document.querySelectorAll('.likcc-summaraidGPT-summary-container').forEach(el => el.remove());

    // 主题处理逻辑
    let finalThemeName = '';
    if (config.darkSelector && isDarkBySelector(config.darkSelector)) {
      finalThemeName = 'dark';
    } else if (config.themeName === 'custom') {
      finalThemeName = 'custom';
    } else if (config.themeName) {
      finalThemeName = config.themeName;
    } else {
      finalThemeName = 'default';
    }

    // 默认配置
    const defaultConfig = {
      logo: '',
      summaryTitle: 'AI摘要',
      gptName: 'TianliGPT',
      typeSpeed: 50,
      target: 'body', // 默认插入到body
      /**
       * themeName: 'default' | 'dark' | 'blue' | 'green' | 'custom'
       * - 'custom' 时用 theme 配色（通过CSS变量实现）
       * - 其他为内置主题
       * - darkSelector 命中时强制 dark
       */
      theme: {},
      typewriter: true,
      themeName: finalThemeName
    };

    // 合并配置
    const finalConfig = { ...defaultConfig, ...config };

    // 创建摘要框HTML片段
    const summaryBoxHTML = likcc_summaraidGPT_createSummaryBoxHTML(finalConfig);
    const fragment = document.createRange().createContextualFragment(summaryBoxHTML);

    // 确定插入位置
    let targetElement = document.body;
    if (finalConfig.target && finalConfig.target !== 'body') {
      const selector = finalConfig.target;
      const foundElement = document.querySelector(selector);
      if (foundElement) {
        targetElement = foundElement;
      } else {
        console.info(`[智阅GPT] 未找到指定的目标元素: ${selector}，摘要功能已关闭`);
        return null;
      }
    }

    // 插入到目标元素内部最前面
    let summaryContainer;
    if (targetElement.firstChild) {
      targetElement.insertBefore(fragment, targetElement.firstChild);
      summaryContainer = targetElement.querySelector('.likcc-summaraidGPT-summary-container');
    } else {
      targetElement.appendChild(fragment);
      summaryContainer = targetElement.querySelector('.likcc-summaraidGPT-summary-container');
    }

    // 主题class注入
    let themeClass = '';
    if (finalThemeName === 'dark') {
      themeClass = 'likcc-summaraidGPT-summary--dark';
    } else if (finalThemeName === 'blue') {
      themeClass = 'likcc-summaraidGPT-summary--blue';
    } else if (finalThemeName === 'green') {
      themeClass = 'likcc-summaraidGPT-summary--green';
    } else if (finalThemeName === 'custom') {
      themeClass = 'likcc-summaraidGPT-summary--custom';
      // 应用自定义主题CSS变量
      if (finalConfig.theme) {
        applyCustomTheme(finalConfig.theme, summaryContainer);
      }
    } else {
      themeClass = 'likcc-summaraidGPT-summary--default';
    }
    summaryContainer.classList.add(themeClass);

    // 集成实时深色模式监听
    if (config.darkSelector) {
      observeDarkSelector(config.darkSelector);
    }

    // 获取内容元素并通过API动态获取摘要
    const contentElement = summaryContainer.querySelector('.likcc-summaraidGPT-summary-content');
    // 先显示loading状态
    contentElement.innerHTML = '<span style="color:#bbb;">正在生成摘要...</span>';

    // 通过API获取摘要内容
    fetchSummaryContent(window.location.pathname, contentElement, finalConfig);

    // 初始化按钮交互
    likcc_summaraidGPT_initButtons(summaryContainer);

    return summaryContainer;
  };

  // 标记已初始化
  window.likcc_summaraidGPT_summaryInitialized = true;

})();
