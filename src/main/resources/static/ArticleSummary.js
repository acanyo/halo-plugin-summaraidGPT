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
    const linkElement = document.querySelector('link[href*="likcc-summaraidGPT-summary.css"]');
    if (!linkElement) {
      console.warn('likcc-summaraidGPT-summary.css 未找到，请确保CSS文件已正确引入');
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
                        <img class="likcc-summaraidGPT-logo" src="${config.logo || ''}" alt="AI Logo">
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

  // 主初始化函数
  window.likcc_summaraidGPT_initSummaryBox = function(config) {
    likcc_summaraidGPT_checkCSS();

    // 新增：全局开关，enable为false时不渲染AI摘要框
    if (config.hasOwnProperty('enable') && config.enable === false) {
      return null;
    }
    // 白名单判断（优先于黑名单）
    if (Array.isArray(config.whitelist) && config.whitelist.length > 0) {
      var path = window.location.pathname;
      var isWhitelisted = config.whitelist.some(function(item) {
        if (typeof item === 'string') {
          // 支持*通配符
          if (item.includes('*')) {
            var pattern = '^' + item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*') + '$';
            var regex = new RegExp(pattern);
            return regex.test(path);
          } else {
            return path.indexOf(item) !== -1;
          }
        } else if (item instanceof RegExp) {
          return item.test(path);
        }
        return false;
      });
      if (!isWhitelisted) return null;
    }

    let finalThemeName = '';
    // 日志：主题优先级判断
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
