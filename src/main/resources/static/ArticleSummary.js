// ArticleSummary.js
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

        this.container = container;
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
        this.logMessage(); // 添加控制台日志输出
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
            // 处理以 * 开头的模式
            if (pattern.startsWith('*')) {
                pattern = pattern.substring(1); // 移除开头的 *
            }
            // 处理以 * 结尾的模式
            if (pattern.endsWith('*')) {
                pattern = pattern.slice(0, -1); // 移除结尾的 *
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
        
        // 如果是纯数字
        if (/^\d+$/.test(width)) {
            return parseInt(width);
        }
        
        // 如果是百分比或类名,直接返回
        return width;
    }

    render() {
        if (!this.container) return;

        // 处理宽度值
        let widthStyle = this.options.width;
        let widthAttr = '';
        
        // 创建一个新的外层容器用于居中
        const wrapperDiv = document.createElement('div');
        wrapperDiv.style.display = 'flex';
        wrapperDiv.style.justifyContent = 'center';
        wrapperDiv.style.alignItems = 'center';
        wrapperDiv.style.width = '100%';
        
        // 根据类型处理宽度
        if (typeof widthStyle === 'number') {
            widthAttr = `class="post-SummaraidGPT gpttheme_${this.options.theme}" style="width: ${widthStyle}px;"`;
        } else if (widthStyle.startsWith('.')) {
            widthAttr = `class="post-SummaraidGPT gpttheme_${this.options.theme} ${widthStyle.substring(1)}"`;
        } else if (widthStyle !== '100%') {  // 只有当不是100%时才使用包装容器
            widthAttr = `class="post-SummaraidGPT gpttheme_${this.options.theme}" style="width: ${widthStyle};"`;
        } else {
            // 如果是100%，不需要居中，直接使用原始容器
            wrapperDiv.style.display = 'block';
            widthAttr = `class="post-SummaraidGPT gpttheme_${this.options.theme}" style="width: 100%;"`;
        }
        
        const summaryHtml = `
            <div ${widthAttr}>
                <div class="SummaraidGPT-title">
                    <div class="SummaraidGPT-title-icon">
                        <img src="${this.options.icon}" alt="图标" style="width: 24px; height: 24px;">
                    </div>
                    <div class="SummaraidGPT-title-text">${this.options.title}</div>
                    <div id="SummaraidGPT-tag">${this.options.source}</div>
                </div>
                <div class="SummaraidGPT-explanation">
                    <p id="typing-text"></p>
                </div>
            </div>
        `;

        // 设置包装容器的内容
        wrapperDiv.innerHTML = summaryHtml;
        
        // 将包装容器插入到原容器的开头
        if (this.container.firstChild) {
            this.container.insertBefore(wrapperDiv, this.container.firstChild);
        } else {
            this.container.appendChild(wrapperDiv);
        }

        this.typeText(this.options.content);
    }

    // 检测暗色主题
    detectDarkMode() {
        if (!articleConfig.darkModeSelector) {
            return false;
        }

        try {
            const selector = articleConfig.darkModeSelector.trim();
            if (!selector) return false;

            if (selector.includes('=')) {
                const [attr, value] = selector.split('=').map(s => s.trim());
                const cleanValue = value.replace(/['"]/g, '');
                return document.documentElement.getAttribute(attr) === cleanValue;
            } else {
                return document.documentElement.hasAttribute(selector);
            }
        } catch (error) {
            console.error('Dark mode detection error:', error);
            return false;
        }
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
}

// 确保在 DOM 加载后初始化组件
document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector(articleConfig.container);
    const summary = new ArticleSummary(container, {
        icon: articleConfig.content.icon,
        title: articleConfig.content.title,
        content: articleConfig.content.text,
        source: articleConfig.content.source,
        theme: articleConfig.theme
    });

    // 导出实例到全局作用域（方便调试和扩展）
    window.articleSummary = summary;
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