// ===== Utilidades de texto =====

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
        var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return map[c] || c;
    });
}

function splitSentences(text) {
    if (!text) return [];
    var normalized = text.replace(/\s+/g, ' ').trim();
    if (!normalized) return [];

    var sentences = [];
    var buffer = '';
    var chars = normalized.split('');

    for (var i = 0; i < chars.length; i++) {
        var ch = chars[i];
        buffer += ch;
        if (ch === '.' || ch === '!' || ch === '?') {
            var next = chars[i + 1];
            if (next === undefined || next === ' ') {
                var trimmed = buffer.trim();
                if (trimmed) sentences.push(trimmed);
                buffer = '';
            }
        }
    }

    var remaining = buffer.trim();
    if (remaining) sentences.push(remaining);
    return sentences;
}

function splitSentencesSmart(text, maxWords) {
    if (!text) return [];
    if (!maxWords) maxWords = 14;

    var baseSentences = splitSentences(text);
    var result = [];

    for (var i = 0; i < baseSentences.length; i++) {
        var s = baseSentences[i];
        var wordCount = s.trim().split(/\s+/).filter(function (w) {
            return w.length > 0;
        }).length;

        if (wordCount <= maxWords) {
            result.push(s);
            continue;
        }

        var parts = s.split(/,\s*/);
        var buffer = '';

        for (var j = 0; j < parts.length; j++) {
            var part = parts[j].trim();
            if (!part) continue;
            if (j < parts.length - 1) part += ',';

            var tentative = buffer ? buffer + ' ' + part : part;
            var tentativeCount = tentative.split(/\s+/).filter(function (w) {
                return w.length > 0;
            }).length;

            if (tentativeCount > maxWords && buffer) {
                result.push(buffer);
                buffer = part;
            } else {
                buffer = tentative;
            }
        }

        if (buffer) result.push(buffer);
    }

    return result;
}

function splitIntoChunks(text, size) {
    if (!text) return [];
    if (size < 1) size = 1;

    var allWords = text.trim().split(/\s+/).filter(function (w) { return w.length > 0; });
    var chunks = [];
    var buffer = [];

    for (var i = 0; i < allWords.length; i++) {
        var w = allWords[i];
        buffer.push(w);

        var endsSentence = /[.!?]$/.test(w);
        var endsClause = /[,;:]$/.test(w);
        var reachedMax = buffer.length >= size;

        if (reachedMax || endsSentence || (endsClause && buffer.length >= 2)) {
            chunks.push({ words: buffer.slice(), text: buffer.join(' ') });
            buffer = [];
        }
    }

    if (buffer.length > 0) {
        chunks.push({ words: buffer.slice(), text: buffer.join(' ') });
    }

    return chunks;
}

function parseChapters(text) {
    if (!text) return [];

    var lines = text.split('\n');
    var chapters = [];
    var current = null;
    var offset = 0;

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var isChapter = /^#\s+(.+)$/.test(line) && !/^##/.test(line);

        if (isChapter) {
            if (current !== null) {
                current.end = offset;
                chapters.push(current);
            }
            var title = line.replace(/^#\s+/, '').trim();
            current = {
                id: chapters.length,
                title: title || ('Capítulo ' + (chapters.length + 1)),
                start: offset + line.length + 1,
                end: 0
            };
        }
        offset += line.length + 1;
    }

    if (current !== null) {
        current.end = text.length;
        chapters.push(current);
    }

    return chapters;
}

function parseSegments(text) {
    if (!text) return [];

    var lines = text.split('\n');
    var segments = [];
    var buffer = [];

    function flushParagraph() {
        var content = buffer.join(' ').trim();
        if (content) {
            segments.push({ type: 'paragraph', content: content });
        }
        buffer = [];
    }

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var trimmed = line.trim();

        if (!trimmed) {
            flushParagraph();
            continue;
        }

        var titleMatch = trimmed.match(/^#\s+(.+)$/);
        if (titleMatch && !/^##/.test(trimmed)) {
            flushParagraph();
            segments.push({ type: 'title', content: titleMatch[1].trim() });
            continue;
        }

        var subMatch = trimmed.match(/^##\s+(.+)$/);
        if (subMatch) {
            flushParagraph();
            segments.push({ type: 'subtitle', content: subMatch[1].trim() });
            continue;
        }

        buffer.push(trimmed);
    }

    flushParagraph();
    return segments;
}

function getChapterContent(fullText, chapter) {
    if (!chapter) return fullText;
    var content = fullText.slice(chapter.start, chapter.end);
    return content.replace(/\n+$/, '').trim();
}