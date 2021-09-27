const fs = require('fs')
const path = require('path')

const code = `
func else continue
`.trim()

const process = src => {
    let hl = src
        .replace(/(break|continue|else|elif|if|in|for|loop|match|return|while|pub|const|type|enum|struct|trait|static|func|party|mut)/g, (m) => `
<span class="keyword">${m}</span>
        `.trim())
        .replace(/(\+=|-=|\/=|\*=|%=|\^=|&=|\\|=|<<=|>>=|=|and|or|<=|>=|<|>|==|!=|!|\+(?!\+)|-(?!-)|\/|\*|%|\^|&|\||<<|>>|\?|\!)/g, m => `
<span class="operator">${m}</span>
        `.trim())

    return `
<pre class="code-highlight">
    ${hl}
</pre>
    `.trim()
}

const outPath = path.join(__dirname, './out.html')
fs.writeFileSync(outPath, process(code))
