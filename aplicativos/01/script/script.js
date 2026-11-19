function renderLesson(text) {
    if (window.AbcModule && typeof window.AbcModule.resetPlayback === 'function') {
        window.AbcModule.resetPlayback();
    }

    const content = document.getElementById('lesson-content');
    content.innerHTML = '';

    // Aceita [CIFRA]...[/CIFRA] (e também tolera [CIFRA]...[CIFRA] caso apareça)
    const tokenRegex = /\[(ABC|CIFRA|MD|LINK|VIDEO)\]([\s\S]*?)(?:\[\/\1\]|\[CIFRA\])/g;
    let lastIndex = 0;
    let match;
    let abcCounter = 0;

    while ((match = tokenRegex.exec(text)) !== null) {
        const textBefore = text.substring(lastIndex, match.index);
        if (textBefore.trim()) {
            content.appendChild(parseText(textBefore));
        }

        const tagType = match[1].toUpperCase();
        const innerContent = match[2];

        if (tagType === 'ABC' && window.AbcModule) {
            content.appendChild(window.AbcModule.render(innerContent, abcCounter++));
        } else if (tagType === 'CIFRA' && window.CifraModule) {
            content.appendChild(window.CifraModule.render(innerContent));
        } else if (tagType === 'MD' && window.MarkdownModule) {
            content.appendChild(window.MarkdownModule.render(innerContent));
        } else if (tagType === 'LINK' && window.LinksModule) {
            content.appendChild(window.LinksModule.render(innerContent));
        } else if (tagType === 'VIDEO' && window.VideoModule) {
            content.appendChild(window.VideoModule.render(innerContent));
        } else {
            content.appendChild(parseText(innerContent));
        }

        lastIndex = match.index + match[0].length;
    }

    const textAfter = text.substring(lastIndex);
    if (textAfter.trim()) {
        content.appendChild(parseText(textAfter));
    }
}
