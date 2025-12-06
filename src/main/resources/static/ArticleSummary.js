(function() {
  'use strict';

  // 版权信息打印（只在首次加载时显示）
  if (!window.likcc_summaraidGPT_scriptLoaded) {
    console.log('%c智阅GPT-智能AI助手', 'color: #4F8DFD; font-size: 16px; font-weight: bold;');
    console.log('%c🚀 智阅点睛，一键洞见——基于AI大模型的Halo智能AI助手', 'color: #666; font-size: 12px;');
    console.log('%c👨‍💻 作者: Handsome | 🌐 网站: https://lik.cc', 'color: #999; font-size: 11px;');
    window.likcc_summaraidGPT_scriptLoaded = true;
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
                <div class="likcc-summaraidGPT-summary-content"></div>
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
  function clearCustomThemeVars(container) {
    const vars = [
      '--likcc-summaraid-bg',
      '--likcc-summaraid-main',
      '--likcc-summaraid-contentFontSize',
      '--likcc-summaraid-title',
      '--likcc-summaraid-content',
      '--likcc-summaraid-gptName',
      '--likcc-summaraid-contentBg',
      '--likcc-summaraid-border',
      '--likcc-summaraid-shadow',
      '--likcc-summaraid-tagBg',
      '--likcc-summaraid-cursor',
    ];
    vars.forEach(v => container.style.removeProperty(v));
  }

  function updateSummaryTheme(isDark, themeName, themeObj) {
    // 确保themeObj是对象格式
    let parsedThemeObj = themeObj;
    if (typeof themeObj === 'string') {
      try {
        parsedThemeObj = JSON.parse(themeObj);
      } catch (e) {
        parsedThemeObj = {};
      }
    }

    document.querySelectorAll('.likcc-summaraidGPT-summary-container').forEach(container => {
      container.classList.remove(
              'likcc-summaraidGPT-summary--dark',
              'likcc-summaraidGPT-summary--blue',
              'likcc-summaraidGPT-summary--green',
              'likcc-summaraidGPT-summary--default',
              'likcc-summaraidGPT-summary--custom'
      );
      if (isDark) {
        clearCustomThemeVars(container);
        container.classList.add('likcc-summaraidGPT-summary--dark');
      } else {
        let cls = 'likcc-summaraidGPT-summary--default';
        if (themeName === 'custom') cls = 'likcc-summaraidGPT-summary--custom';
        else if (themeName === 'blue') cls = 'likcc-summaraidGPT-summary--blue';
        else if (themeName === 'green') cls = 'likcc-summaraidGPT-summary--green';
        else if (themeName === 'default' || !themeName) cls = 'likcc-summaraidGPT-summary--default';
        if (cls === 'likcc-summaraidGPT-summary--custom') {
          applyCustomTheme(parsedThemeObj, container);
        } else {
          clearCustomThemeVars(container);
        }
        container.classList.add(cls);
      }
    });
  }

  function observeDarkSelector(selector, themeName, themeObj) {
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

    const callback = () => updateSummaryTheme(checkIsDark(), themeName, themeObj);

    new MutationObserver(callback).observe(html, obsConfig);
    new MutationObserver(callback).observe(body, obsConfig);
    callback(); // 保证初始状态
  }

  // 全局变量存储文章名称（页面切换时需要重置）
  let globalPostName = null;
  // 是否为隐藏数据模式（不显示UI，只入库）
  let isHiddenDataMode = false;

  // 重置状态（用于页面切换时）
  function resetState() {
    globalPostName = null;
    isHiddenDataMode = false;
  }

  // 获取文章名称(postName)
  function getPostName() {
    if (globalPostName) {
      return globalPostName;
    }

    const aiSummaryTag = document.querySelector('ai-summaraidGPT');
    if (aiSummaryTag) {
      globalPostName = aiSummaryTag.getAttribute('name');
      isHiddenDataMode = false;
      return globalPostName;
    }
    const aiDataTag = document.querySelector('ai-summaraidGPT-data');
    if (aiDataTag) {
      globalPostName = aiDataTag.getAttribute('name');
      isHiddenDataMode = true;
      return globalPostName;
    }

    return null;
  }

  // 通过API获取摘要内容（静默模式）
  function fetchSummaryContentSilent() {
    const postName = getPostName();
    if (!postName) return;

    const apiUrl = `/apis/api.summary.summaraidgpt.lik.cc/v1alpha1/updateContent`;
    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: postName
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .catch(error => {
      console.warn('摘要入库失败:', error);
    });
  }

  // 通过API获取摘要内容
  function fetchSummaryContent(permalink, contentElement, config) {
    const apiUrl = `/apis/api.summary.summaraidgpt.lik.cc/v1alpha1/updateContent`;

    // 从ai-summaraidGPT标签获取postName
    const postName = getPostName();

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: postName
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
      contentElement.innerHTML = '摘要加载失败，请稀后重试';
    });
  }

  // 通过API获取摘要配置
  function fetchSummaryConfig() {
    return fetch('/apis/api.summary.summaraidgpt.lik.cc/v1alpha1/summaryConfig')
      .then(response => {

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        return data;
      })
      .catch(error => {
        // 返回默认配置
        return {
          logo: 'icon.svg',
          summaryTitle: '文章摘要',
          gptName: '智阅GPT',
          typeSpeed: 20,
          darkSelector: '',
          themeName: 'custom',
          theme: '{"bg": "#f7f9fe", "main": "#4F8DFD", "contentFontSize": "16px", "title": "#3A5A8C", "content": "#222", "gptName": "#7B88A8", "contentBg": "#fff", "border": "#e3e8f7", "shadow": "0 2px 12px 0 rgba(60,80,180,0.08)", "tagBg": "#f0f4ff", "cursor": "#4F8DFD"}',
          typewriter: true
        };
      });
  }

  // 处理ai-summaraidGPT标签
  function processSummaryWidgets(userConfig = {}) {
    const widgets = document.querySelectorAll('ai-summaraidGPT');
    if (widgets.length === 0) {
      return Promise.resolve([]);
    }

    // 先获取API配置，然后与用户配置合并
    return fetchSummaryConfig().then(apiConfig => {
      // 合并API配置和用户配置，用户配置优先级更高
      const config = { ...apiConfig, ...userConfig };



      const containers = [];

      widgets.forEach(widget => {
        // 获取widget的属性
        const kind = widget.getAttribute('kind') || '';
        const group = widget.getAttribute('group') || '';
        const name = widget.getAttribute('name') || '';

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

        // 解析theme字符串为对象
        let themeObj = {};

        try {
          if (config.theme && typeof config.theme === 'string') {
            // 尝试解析JSON字符串
            themeObj = JSON.parse(config.theme);
          } else if (config.theme && typeof config.theme === 'object') {
            themeObj = config.theme;
          } else {
            // 提供默认主题对象
            themeObj = {
              bg: '#f7f9fe',
              main: '#4F8DFD',
              contentFontSize: '16px',
              title: '#3A5A8C',
              content: '#222',
              gptName: '#7B88A8',
              contentBg: '#fff',
              border: '#e3e8f7',
              shadow: '0 2px 12px 0 rgba(60,80,180,0.08)',
              tagBg: '#f0f4ff',
              cursor: '#4F8DFD'
            };
          }
        } catch (e) {
          // 解析失败时使用默认主题
          themeObj = {
            bg: '#f7f9fe',
            main: '#4F8DFD',
            contentFontSize: '16px',
            title: '#3A5A8C',
            content: '#222',
            gptName: '#7B88A8',
            contentBg: '#fff',
            border: '#e3e8f7',
            shadow: '0 2px 12px 0 rgba(60,80,180,0.08)',
            tagBg: '#f0f4ff',
            cursor: '#4F8DFD'
          };
        }

        // 默认配置
        const defaultConfig = {
          logo: '',
          summaryTitle: 'AI摘要',
          gptName: 'TianliGPT',
          typeSpeed: 50,
          /**
           * themeName: 'default' | 'dark' | 'blue' | 'green' | 'custom'
           * - 'custom' 时用 theme 配色（通过CSS变量实现）
           * - 其他为内置主题
           * - darkSelector 命中时强制 dark
           */
          theme: themeObj,
          typewriter: true,
          themeName: finalThemeName
        };

        // 合并配置
        const finalConfig = { ...defaultConfig, ...config };

        // 先获取并存储文章名称到全局变量
        getPostName();

        // 创建摘要框HTML片段
        const summaryBoxHTML = likcc_summaraidGPT_createSummaryBoxHTML(finalConfig);
        const fragment = document.createRange().createContextualFragment(summaryBoxHTML);

        // 替换widget标签为实际的摘要框
        const summaryContainer = fragment.querySelector('.likcc-summaraidGPT-summary-container');
        widget.parentNode.replaceChild(fragment, widget);

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
          if (themeObj && Object.keys(themeObj).length > 0) {
            applyCustomTheme(themeObj, summaryContainer);
          }
        } else {
          themeClass = 'likcc-summaraidGPT-summary--default';
        }
        summaryContainer.classList.add(themeClass);

        // 集成实时深色模式监听
        if (config.darkSelector) {
          observeDarkSelector(config.darkSelector, finalThemeName, themeObj);
        }

        // 获取内容元素并通过API动态获取摘要
        const contentElement = summaryContainer.querySelector('.likcc-summaraidGPT-summary-content');
        // 先显示loading状态
        contentElement.innerHTML = '<span style="color:#bbb;">正在生成摘要...</span>';

        // 通过API获取摘要内容
        fetchSummaryContent(window.location.pathname, contentElement, finalConfig);

        containers.push(summaryContainer);
      });

      return containers;
    });
  }

  // 主初始化函数 - 现在处理ai-summaraidGPT标签
  window.likcc_summaraidGPT_initSummaryBox = function(userConfig = {}) {
    likcc_summaraidGPT_checkCSS();
    return processSummaryWidgets(userConfig);
  };

  // 自动初始化 - 处理页面中的ai-summaraidGPT标签
  function autoInitSummaryBox() {
    const widgets = document.querySelectorAll('ai-summaraidGPT');
    const dataWidgets = document.querySelectorAll('ai-summaraidGPT-data');
    const summaryContainer = document.querySelector('.likcc-summaraidGPT-summary-container');
    
    if (widgets.length > 0 && !summaryContainer) {
      likcc_summaraidGPT_initSummaryBox();
    } else if (dataWidgets.length > 0 && widgets.length === 0) {
      getPostName();
      fetchSummaryContentSilent();
    }
  }

  // 页面加载完成后自动处理标签
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInitSummaryBox, { once: true });
  } else {
    // 如果页面已经加载完成，立即执行
    autoInitSummaryBox();
  }

  // 支持pjax页面切换
  document.addEventListener('pjax:success', autoInitSummaryBox);
  document.addEventListener('pjax:complete', autoInitSummaryBox);

  // 支持 swup 页面切换
  document.addEventListener('swup:content-replaced', function() {
    resetState();
    autoInitSummaryBox();
  });

  // 暴露重新初始化方法，方便外部调用
  window.likcc_summaraidGPT_reinit = function(userConfig = {}) {
    resetState();
    return likcc_summaraidGPT_initSummaryBox(userConfig);
  };

})();
