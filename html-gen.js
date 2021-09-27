const fs = require('fs')
const path = require('path')

const code = `
func foo(kek: int, mut ref lol: &str) {
    foo(kek: 123, lol: "Hello, world!");
}
`.trim()

const regexps = {
    $ignore: /^[ \t\n]$/g,
    string: /(\"([^\\\"]|\\.)*\")/g,
    keyword: [
        /\b(pub|const|type|enum|struct|trait|static|func|party)\b/g,
        /\b(else)\b/g,
        /\b(break|continue|elif|if|in|for|loop|match|return|while)\b/g,
        /(_)/g,
    ],
    modifier: [
        /\b(mut)\b/g,
        /\b(ref)\b/g,
    ],
    terminator: /(;)/g,
    separator: /(,)/g,
    punctuation: /(::|\{|\}|\(|\)|\[|\])/g,
    operator: [
        /(\+=|-=|\/=|\*=|%=|\^=|&=|\\|=|<<=|>>=|=)/g,
        /(<=|>=|<|>|==|!=)/g,
        /(!|\+(?!\+)|-(?!-)|\/|\*|%|\^|\&|\||<<|>>)/g,
        /\b(and|or)\b/g,
        /:(?!:)/g,
    ],
    constant: [
        /\b(true|false)\b/g,
        /(([0-9][0-9_]*)(?:([ui](?:8|16|32|64|128)|i|u))?)/g,
        /((0x[a-fA-F0-9_]+)(?:([ui](?:8|16|32|64|128)|i|u))?)/g,
        /((0o[0-7_]+)(?:([ui](?:8|16|32|64|128)|i|u))?)/g,
        /((0b[01_]+)(?:([ui](?:8|16|32|64|128)|i|u))?)/g,
        /(([0-9][0-9_]*\.[0-9][0-9_]*))/g,
        /(([0-9][0-9_]*(?:\.[0-9][0-9_]*)?)(f32|f64|f|d))/g,
        /(([0-9][0-9_]*(?:\.[0-9][0-9_]*)?[eE][+-]?[0-9_]+)(f32|f64|f|d)?)/g,
    ],
    type: [
        /([A-Z][a-zA-Z0-9_]+)/g,
        /\b(bool|char|[ui](?:8|16|32|64|128)|f(?:16|32|64|128)|int|uint|str|String|Self|Option|Result)\b/g,
    ],
    func: /([a-z_][\w_]+(?=\())/g,
    variable: /(\w+)/,
    other: /(\W)/,
}

const fullRegex = new RegExp(Object.values(regexps).map(r => {
    if (Array.isArray(r)) {
        for (const subr of r) {
            return subr.source
        }
    } else {
        return r.source
    }
}).join('|'), 'gm')

const tmpl = (rule, m) => {
    if (rule === '$ignore') {
        return m
    }
    return `
<span class="${rule}">${m}</span>
    `.trim()
}

const process = (src, theme) => {
    const hl = src.replace(fullRegex, m => {
        for (const [rule, regex] of Object.entries(regexps)) {
            // !Array.isArray(regex) && console.log(`check '${m}' for`, rule, regex)

            if (Array.isArray(regex)) {
                for (const r of regex) {
                    // console.log(`check '${m}' for`, rule, r)
                    if (r.test(m)) {
                        return tmpl(rule, m)
                    }
                }
            } else if (regex.test(m)) {
                return tmpl(rule, m)
            }
        }
        throw new Error(`WTF???!?!?!: '${m}'`)
    })

    return `
<pre class="code-highlight ${theme}-theme">
${hl}
</pre>
    `.trim()
}

const themes = ['light', 'dimmed', 'dark']
let res = ''

for (const th of themes) {
    res += process(code, th) + '\n\n'
}

const outPath = path.join(__dirname, './out.html')
fs.writeFileSync(outPath, res)
