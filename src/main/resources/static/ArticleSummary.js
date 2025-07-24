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

  // 公共主题切换函数
  function updateSummaryTheme(isDark) {
    document.querySelectorAll('.likcc-summaraidGPT-summary-container').forEach(container => {
      container.classList.remove(
              'likcc-summaraidGPT-summary--dark',
              'likcc-summaraidGPT-summary--blue',
              'likcc-summaraidGPT-summary--green',
              'likcc-summaraidGPT-summary--default'
      );
      container.classList.add(isDark ? 'likcc-summaraidGPT-summary--dark' : 'likcc-summaraidGPT-summary--default');
    });
  }

  // 精简后的实时监听深色模式切换
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

  // 主初始化函数
  window.likcc_summaraidGPT_initSummaryBox = function(config) {
    likcc_summaraidGPT_checkCSS();

    if (config.hasOwnProperty('enable') && config.enable === false) {
      return null;
    }
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
    let finalThemeName = '';
    if (config.darkSelector && isDarkBySelector(config.darkSelector)) {
      finalThemeName = 'dark';
    } else if (config.themeName === 'custom') {
      finalThemeName = '';
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
      content: '这是一个AI生成的摘要内容...',
      typeSpeed: 50,
      target: 'body', // 默认插入到body
      /**
       * themeName: 'default' | 'dark' | 'blue' | 'green' | 'custom'
       * - 'custom' 时用 theme 配色
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
    } else {
      themeClass = 'likcc-summaraidGPT-summary--default';
    }
    summaryContainer.classList.add(themeClass);
    // 集成实时深色模式监听
    if (config.darkSelector) {
      observeDarkSelector(config.darkSelector);
    }
    // 获取内容元素并输出摘要
    const contentElement = summaryContainer.querySelector('.likcc-summaraidGPT-summary-content');
    // 先显示骨架loading
    contentElement.innerHTML = '<span style="color:#bbb;">正在生成摘要...</span>';
    setTimeout(() => {
      if(finalConfig.typewriter) {
        likcc_summaraidGPT_typeWriter(contentElement, finalConfig.content, finalConfig.typeSpeed);
      } else {
        contentElement.innerHTML = finalConfig.content;
      }
    }, 300);
    return summaryContainer;
  };

  // 标记已初始化
  window.likcc_summaraidGPT_summaryInitialized = true;

})();
