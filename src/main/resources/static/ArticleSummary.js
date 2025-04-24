
// 添加标记，用于控制日志是否已打印
let hasLoggedMessage = false;

// 防抖函数声明
const Handsomedebounce = (function() {
    let timeout;
    return function(func, wait) {
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    };
})();

class ArticleSummary {
    constructor(container, options = {}) {
        // 检查是否启用摘要功能
        if (!articleConfig.enableSummary) {
            return;
        }

        // 检查当前URL是否在黑名单中
        if (this.shouldHideSummary()) {
            return;
        }

        // 检查当前URL是否符合配置的模式
        if (!this.shouldShowSummary()) {
            return;
        }

        // 只在首次加载时打印日志
        if (!hasLoggedMessage) {
            this.logMessage();
            hasLoggedMessage = true;
        }

        // 获取目标容器
        this.container = this.findTargetContainer(container);
        const pageTheme = this.detectPageTheme();
        
        // 如果不是特定主题，移除固定宽度
        if (pageTheme !== 'microimmersion-webjing') {
            const style = document.createElement('style');
            style.textContent = `
                .post-SummaraidGPT {
                    width: 100% !important;
                    max-width: none !important;
                }
                @media screen and (min-width: 896px) {
                    .post-SummaraidGPT {
                        width: 100% !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        this.options = {
            icon: options.icon || './icon.svg',
            title: options.title || '文章摘要',
            content: this.cleanContent(options.content) || '',
            source: options.source || 'SummaraidGPT',
            theme: options.theme || 'default',
            width: this.processWidth(articleConfig.summaryWidth)
        };
        this.options.theme = this.detectDarkMode() ? 'dark' : (options.theme || 'default');
        if (articleConfig.darkModeSelector) {
            this.observeDarkMode();
        }
        this.render();
    }

    // 控制台日志输出
    logMessage() {
        console.log(`\n %c 智阅GPT-智能AI摘要 %c https://www.lik.cc/ \n`,
                'color: #fadfa3; background: #030307; padding:5px 0;',
                'background: #fadfa3; padding:5px 0;');
    }

    // 检查是否在黑名单中
    shouldHideSummary() {
        const currentUrl = window.location.href;
        return articleConfig.blacklist.includes(currentUrl);
    }

    // 检查当前URL是否符合配置的模式
    shouldShowSummary() {
        const currentPath = window.location.pathname;
        return articleConfig.urlPatterns.some(pattern => {
            // 移除引号
            pattern = pattern.replace(/['"]/g, '');
            
            // 处理以 * 开头的模式
            if (pattern.startsWith('*')) {
                pattern = pattern.substring(1);
            }
            
            // 处理以 * 结尾的模式
            if (pattern.endsWith('*')) {
                pattern = pattern.slice(0, -1);
            }

            // 将剩余的 * 转换为正则表达式的 .*
            pattern = pattern.replace(/\*/g, '.*');

            // 如果模式不以 / 开头，添加 /
            if (!pattern.startsWith('/')) {
                pattern = '/' + pattern;
            }

            // 创建正则表达式
            const regex = new RegExp(pattern);
            return regex.test(currentPath);
        });
    }

    cleanContent(content) {
        // 去除多余的空白行
        return content.replace(/\n\s*\n/g, '\n').trim();
    }

    // 处理宽度值
    processWidth(width) {
        if (!width || width === 'null') {
            return '100%';  // 默认值
        }

        // 移除可能存在的引号
        width = width.replace(/['"]/g, '');

        // 如果是纯数字，直接返回100%，让CSS控制宽度
        if (/^\d+$/.test(width)) {
            return '100%';
        }

        // 如果是类名，直接返回
        if (width.startsWith('.')) {
            return width;
        }

        // 其他情况返回100%，让CSS控制宽度
        return '100%';
    }

    render() {
        if (!this.container) return;

        let widthStyle = this.options.width;
        let widthAttr = '';

        // 简化宽度处理
        if (widthStyle.startsWith('.')) {
            widthAttr = `class="post-SummaraidGPT gpttheme_${this.options.theme} ${widthStyle.substring(1)}"`;
        } else {
            widthAttr = `class="post-SummaraidGPT gpttheme_${this.options.theme}"`;
        }

        const summaryHtml = `
            <div ${widthAttr}>
                <div class="SummaraidGPT-title">
                    <div class="SummaraidGPT-title-icon">
                        <img src="${this.options.icon}" alt="图标" style="width: 24px; height: 24px;">
                    </div>
                    <div class="SummaraidGPT-title-text">${this.options.title || '文章摘要'}</div>
                    <div id="SummaraidGPT-tag">${this.options.source}</div>
                </div>
                <div class="SummaraidGPT-explanation">
                    <p id="typing-text"></p>
                </div>
            </div>
        `;

        // 直接插入内容，不需要额外的包装容器
        if (this.container.firstChild) {
            this.container.insertBefore(document.createRange().createContextualFragment(summaryHtml), this.container.firstChild);
        } else {
            this.container.innerHTML = summaryHtml;
        }

        this.typeText(this.options.content);
    }

    // 检测暗色主题
    detectDarkMode() {
        if (!articleConfig.darkModeSelector) {
            return false;
        }

        try {
            const html = document.documentElement;
            const selector = articleConfig.darkModeSelector.trim();

            // 1. 检查 class
            if (html.classList.contains('dark') ||
                    html.classList.contains('theme-dark') ||
                    html.classList.contains('darkmode') ||
                    html.classList.contains('night-mode')) {
                return true;
            }

            // 2. 检查 data-* 属性
            if (html.dataset.theme === 'dark' ||
                    html.dataset.mode === 'dark' ||
                    html.dataset.colorScheme === 'dark' ||
                    html.dataset.darkMode === 'true') {
                return true;
            }

            // 3. 检查其他常见属性
            const commonAttrs = ['theme', 'mode', 'color-scheme', 'color-mode', 'data-theme'];
            for (const attr of commonAttrs) {
                const value = html.getAttribute(attr);
                if (value && ['dark', 'night', 'black'].includes(value.toLowerCase())) {
                    return true;
                }
            }

            // 4. 检查用户配置的选择器
            if (selector.includes('=')) {
                const [attr, value] = selector.split('=').map(s => s.trim());
                const cleanValue = value.replace(/['"]/g, '');
                return html.getAttribute(attr) === cleanValue;
            } else {
                return html.hasAttribute(selector);
            }

            return false;
        } catch (error) {
            console.error('Dark mode detection error:', error);
            return false;
        }
    }

    // 监听主题变化
    observeDarkMode() {
        try {
            // 监听 html 元素的所有相关属性变化
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes') {
                        const isDark = this.detectDarkMode();
                        this.updateTheme(isDark ? 'dark' : 'default');
                    }
                });
            });

            // 监听所有可能的属性变化
            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: [
                    'class',
                    'data-theme',
                    'data-mode',
                    'data-color-scheme',
                    'theme',
                    'mode',
                    'color-scheme',
                    'color-mode',
                    articleConfig.darkModeSelector.split('=')[0].trim()
                ]
            });
        } catch (error) {
            console.error('Dark mode observer error:', error);
        }
    }

    // 更新主题
    updateTheme(theme) {
        if (this.options.theme !== theme) {
            this.options.theme = theme;
            const container = document.querySelector('.post-SummaraidGPT');
            if (container) {
                container.style.transition = 'background-color 0.3s, color 0.3s';
                container.className = `post-SummaraidGPT gpttheme_${theme}`;
            }
        }
    }

    // 打字机效果函数
    typeText(text) {
        const typingTextElement = document.getElementById('typing-text');
        typingTextElement.innerHTML = '';
        let index = 0;
        const typingSpeed = 50;
        const cursorElement = document.createElement('span');
        cursorElement.innerHTML = '|';
        cursorElement.style.animation = 'blink 0.7s step-end infinite';

        // 添加光标淡出动画样式
        const fadeOutStyle = document.createElement('style');
        fadeOutStyle.innerHTML = `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            .cursor-fadeout {
                animation: fadeOut 0.5s forwards;
            }
        `;
        document.head.appendChild(fadeOutStyle);

        const type = () => {
            if (index <= text.length) {
                const currentText = text.slice(0, index);
                typingTextElement.innerHTML = currentText;
                typingTextElement.appendChild(cursorElement);

                if (index === text.length) {
                    // 添加淡出动画后移除光标
                    setTimeout(() => {
                        cursorElement.classList.add('cursor-fadeout');
                        setTimeout(() => {
                            cursorElement.remove();
                            fadeOutStyle.remove();  // 清理动画样式
                        }, 500);
                    }, 500);
                } else {
                    index++;
                    const randomDelay = typingSpeed + Math.random() * 50;
                    setTimeout(type, randomDelay);
                }
            }
        };
        type();
    }

    updateContent(content) {
        this.options.content = this.cleanContent(content);
        this.render();
    }

    // 添加主题检测方法
    detectPageTheme() {
        const metaTheme = document.querySelector('meta[name="theme-template"]');
        return metaTheme ? metaTheme.getAttribute('content') : null;
    }

    // 查找目标容器
    findTargetContainer(selector) {
        if (!selector) return null;
        
        // 如果已经是DOM元素，直接返回
        if (selector instanceof Element) {
            return selector;
        }
        
        // 确保selector是字符串
        selector = String(selector);
        
        // 如果是ID选择器(以#开头)
        if (selector.startsWith('#')) {
            return document.getElementById(selector.substring(1));
        }
        
        // 如果是标签选择器
        return document.querySelector(selector);
    }

    destroy() {
        // 清理事件监听
        if (this.darkModeObserver) {
            this.darkModeObserver.disconnect();
        }
        
        // 清理DOM元素
        const container = document.querySelector('.post-SummaraidGPT');
        if (container) {
            container.remove();
        }
        
        // 清理定时器
        if (this.typingTimer) {
            clearTimeout(this.typingTimer);
        }
        
        // 清理全局实例
        if (window.articleSummary === this) {
            window.articleSummary = null;
        }
    }

    // 添加标题处理方法
    processTitle(title) {
        if (!title) {
            return null;
        }

        // 处理字符串类型
        if (typeof title === 'string') {
            return title.trim();
        }

        // 处理对象类型
        if (typeof title === 'object') {
            // 如果title是对象,尝试获取text属性
            if (title.text) {
                return title.text.trim();
            }
            // 如果title是对象,尝试获取content属性
            if (title.content) {
                return title.content.trim();
            }
            // 如果title是对象,尝试获取value属性
            if (title.value) {
                return title.value.trim();
            }
        }

        return null;
    }
}

// 修改Pjax处理函数
function handlePjax() {
    try {
        // 清理旧实例
        if (window.articleSummary) {
            window.articleSummary.destroy();
        }
        
        // 检查是否启用摘要功能
        if (!articleConfig.enableSummary) {
            return;
        }

        // 检查当前URL是否在黑名单中
        const currentUrl = window.location.href;
        if (articleConfig.blacklist.includes(currentUrl)) {
            return;
        }

        // 检查当前URL是否符合配置的模式
        const currentPath = window.location.pathname;
        const shouldShow = articleConfig.urlPatterns.some(pattern => {
            // 移除引号
            pattern = pattern.replace(/['"]/g, '');
            
            // 处理以 * 开头的模式
            if (pattern.startsWith('*')) {
                pattern = pattern.substring(1);
            }
            
            // 处理以 * 结尾的模式
            if (pattern.endsWith('*')) {
                pattern = pattern.slice(0, -1);
            }

            // 将剩余的 * 转换为正则表达式的 .*
            pattern = pattern.replace(/\*/g, '.*');

            // 如果模式不以 / 开头，添加 /
            if (!pattern.startsWith('/')) {
                pattern = '/' + pattern;
            }

            // 创建正则表达式
            const regex = new RegExp(pattern);
            return regex.test(currentPath);
        });

        if (!shouldShow) {
            return;
        }

        // 获取文章摘要
        const articleContent = document.querySelector(articleConfig.container);
        if (!articleContent) {
            return;
        }

        // 从meta标签获取摘要
        const metaSummary = document.querySelector('meta[name="description"]');
        const summaryText = metaSummary ? metaSummary.getAttribute('content') : '';

        // 重新初始化组件
        const container = document.querySelector(articleConfig.container);
        if (container) {
            const articleSummaryInstance = new ArticleSummary(container, {
                icon: articleConfig.content.icon,
                title: articleConfig.content.title,
                content: summaryText || articleConfig.content.text,
                source: articleConfig.content.source,
                theme: articleConfig.theme
            });
            window.articleSummary = articleSummaryInstance;
        }
    } catch (error) {
        console.error('ArticleSummary Pjax处理错误:', error);
        // 优雅降级处理
        if (window.articleSummary) {
            window.articleSummary.destroy();
        }
    }
}

// 添加文章内容处理方法
function processArticleContent(content) {
    if (!content) {
        return '';
    }

    // 处理换行和空格
    return content
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// 使用防抖处理Pjax事件
const debouncedHandlePjax = Handsomedebounce(handlePjax, 100);

// 监听Pjax事件
document.addEventListener('DOMContentLoaded', debouncedHandlePjax);
document.addEventListener('pjax:complete', debouncedHandlePjax);
document.addEventListener('page:load', debouncedHandlePjax);
document.addEventListener('turbolinks:load', debouncedHandlePjax);

// 监听Pjax开始事件
document.addEventListener('pjax:start', function() {
    if (window.articleSummary) {
        window.articleSummary.destroy();
    }
});

// 监听Pjax错误事件
document.addEventListener('pjax:error', function() {
    if (window.articleSummary) {
        window.articleSummary.destroy();
    }
});

// 修改初始化函数
function initArticleSummary(content = null) {
    return new Promise((resolve) => {
        // 检查是否启用摘要功能
        if (!articleConfig.enableSummary) {
            resolve();
            return;
        }
        
        // 先移除所有已存在的摘要组件
        document.querySelectorAll('.post-SummaraidGPT').forEach(el => el.remove());
        
        // 清理旧实例
        if (window.articleSummary && window.articleSummary.destroy) {
            window.articleSummary.destroy();
        }

        // 重新初始化组件
        const container = document.querySelector(articleConfig.container);
        if (container) {
            window.articleSummary = new ArticleSummary(container, {
                icon: articleConfig.content.icon,
                title: articleConfig.content.title,
                content: content || articleConfig.content.text,
                source: articleConfig.content.source,
                theme: articleConfig.theme
            });
        }
        resolve();
    });
}

// 修改原有的初始化代码
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否是Pjax加载
    if (!window.isPjaxLoading) {
        initArticleSummary();
    }
});

// 修改Pjax更新处理
document.addEventListener('pjax:start', function() {
    // 标记Pjax正在加载
    window.isPjaxLoading = true;
    
    // 在页面切换开始时就清理旧实例
    document.querySelectorAll('.post-SummaraidGPT').forEach(el => el.remove());
    if (window.articleSummary && window.articleSummary.destroy) {
        window.articleSummary.destroy();
    }
});

document.addEventListener('pjax:complete', function() {
    // 获取新的摘要内容
    fetch(window.location.href)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // 查找包含articleConfig的脚本
            const scripts = doc.querySelectorAll('script:not([src])');
            let newContent = null;
            let newConfig = null;
            
            scripts.forEach(script => {
                if (script.textContent.includes('articleConfig')) {
                    try {
                        // 提取content.text
                        const match = script.textContent.match(/text:\s*['"]([^'"]*)['"]/);
                        if (match && match[1]) {
                            newContent = match[1];
                        }
                        
                        // 提取enableSummary配置
                        const enableMatch = script.textContent.match(/enableSummary:\s*(true|false)/);
                        if (enableMatch && enableMatch[1]) {
                            // 更新全局配置
                            articleConfig.enableSummary = enableMatch[1] === 'true';
                        }
                    } catch (e) {
                        console.error('解析摘要内容失败:', e);
                    }
                }
            });
            
            // 使用新内容初始化
            return initArticleSummary(newContent);
        })
        .catch(error => {
            console.error('获取新摘要内容失败:', error);
            // 使用现有配置初始化
            return initArticleSummary();
        })
        .finally(() => {
            // 重置Pjax加载标记
            window.isPjaxLoading = false;
        });
});

// 监听popstate事件（浏览器前进/后退）
window.addEventListener('popstate', function() {
    // 重新检查配置并初始化
    fetch(window.location.href)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // 查找包含articleConfig的脚本
            const scripts = doc.querySelectorAll('script:not([src])');
            
            scripts.forEach(script => {
                if (script.textContent.includes('articleConfig')) {
                    try {
                        // 提取enableSummary配置
                        const enableMatch = script.textContent.match(/enableSummary:\s*(true|false)/);
                        if (enableMatch && enableMatch[1]) {
                            // 更新全局配置
                            articleConfig.enableSummary = enableMatch[1] === 'true';
                        }
                    } catch (e) {
                        console.error('解析配置失败:', e);
                    }
                }
            });
            
            // 重新初始化
            initArticleSummary();
        })
        .catch(error => {
            console.error('获取配置失败:', error);
            initArticleSummary();
        });
});

// 监听hashchange事件（URL哈希变化）
window.addEventListener('hashchange', function() {
    // 重新检查配置并初始化
    initArticleSummary();
});

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ArticleSummary;
}

// 添加光标闪烁的 CSS 动画
const style = document.createElement('style');
style.innerHTML = `
@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}`;
document.head.appendChild(style);