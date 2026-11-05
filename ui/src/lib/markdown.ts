function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function inline(value: string): string {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
}

export function renderMarkdown(source: string): string {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  let index = 0
  let inCode = false
  let code: string[] = []

  const isRow = (line: string): boolean => /^\s*\|.*\|\s*$/.test(line)
  const isSeparator = (line: string): boolean => /^\s*\|?[\s:\-|]+\|?\s*$/.test(line)
  const cells = (line: string): string[] =>
    line
      .trim()
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((cell) => inline(cell.trim()))

  while (index < lines.length) {
    const line = lines[index]

    if (/^\s*```/.test(line)) {
      if (!inCode) {
        inCode = true
        code = []
      } else {
        inCode = false
        out.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`)
      }
      index += 1
      continue
    }

    if (inCode) {
      code.push(line)
      index += 1
      continue
    }

    if (isRow(line) && index + 1 < lines.length && isSeparator(lines[index + 1])) {
      out.push('<table><thead><tr>')
      out.push(cells(line).map((c) => `<th>${c}</th>`).join(''))
      out.push('</tr></thead><tbody>')
      index += 2
      while (index < lines.length && isRow(lines[index]) && !isSeparator(lines[index])) {
        out.push('<tr>' + cells(lines[index]).map((c) => `<td>${c}</td>`).join('') + '</tr>')
        index += 1
      }
      out.push('</tbody></table>')
      continue
    }

    const heading = line.match(/^\s*(#{1,4})\s+(.*)/)
    if (heading) {
      const level = heading[1].length
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`)
      index += 1
      continue
    }

    if (/^\s*---+\s*$/.test(line)) {
      out.push('<hr>')
      index += 1
      continue
    }

    const quote = line.match(/^\s*>\s?(.*)/)
    if (quote) {
      out.push(`<blockquote>${inline(quote[1])}</blockquote>`)
      index += 1
      continue
    }

    const bullet = line.match(/^\s*([-*]|\d+[.)])\s+(.*)/)
    if (bullet) {
      const tag = /^\d/.test(bullet[1]) ? 'ol' : 'ul'
      out.push(`<${tag}>`)
      while (index < lines.length) {
        const item = lines[index].match(/^\s*([-*]|\d+[.)])\s+(.*)/)
        if (!item) break
        out.push(`<li>${inline(item[2])}</li>`)
        index += 1
      }
      out.push(`</${tag}>`)
      continue
    }

    if (line.trim() === '') {
      index += 1
      continue
    }

    out.push(`<p>${inline(line)}</p>`)
    index += 1
  }

  return out.join('')
}
