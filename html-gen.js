// const regexps = {
//     $ignore: /^[ \t\n]$/,
//     string: /(\"([^\\\"]|\\.)*\")/,
//     keyword: [
//         /(\b(pub|const|type|enum|struct|trait|static|func|party)\b)/,
//         /(\b(else)\b)/,
//         /\b(break|continue|elif|if|in|for|loop|match|return|while)\b/,
//         /(_)/,
//     ],
//     modifier: [
//         /\b(mut)\b/,
//         /\b(ref)\b/,
//     ],
//     terminator: /(;)/,
//     separator: /(,)/,
//     punctuation: /(::|\{|\}|\(|\)|\[|\])/,
//     operator: [
//         /(\+=|-=|\/=|\*=|%=|\^=|&=|\\|=|<<=|>>=|=)/,
//         /(<=|>=|<|>|==|!=)/,
//         /(!|\+(?!\+)|-(?!-)|\/|\*|%|\^|\&|\||<<|>>)/,
//         /\b(and|or)\b/,
//         /:(?!:)/,
//     ],
//     constant: [
//         /\b(true|false)\b/,
//         /(([0-9][0-9_]*)(?:([ui](?:8|16|32|64|128)|i|u))?)/,
//         /((0x[a-fA-F0-9_]+)(?:([ui](?:8|16|32|64|128)|i|u))?)/,
//         /((0o[0-7_]+)(?:([ui](?:8|16|32|64|128)|i|u))?)/,
//         /((0b[01_]+)(?:([ui](?:8|16|32|64|128)|i|u))?)/,
//         /(([0-9][0-9_]*\.[0-9][0-9_]*))/,
//         /(([0-9][0-9_]*(?:\.[0-9][0-9_]*)?)(f32|f64|f|d))/,
//         /(([0-9][0-9_]*(?:\.[0-9][0-9_]*)?[eE][+-]?[0-9_]+)(f32|f64|f|d)?)/,
//     ],
//     type: [
//         /([A-Z][a-zA-Z0-9_]+)/,
//         /\b(bool|char|[ui](?:8|16|32|64|128)|f(?:16|32|64|128)|int|uint|str|String|Self|Option|Result)\b/,
//     ],
//     func: /([\w_]+)(?=\()/,
//     variable: /(\w+)/,
//     other: /(\W)/,
// }


const fs = require('fs')
const path = require('path')

const code = `
func foo(kek: int, mut ref lol: &str) {
    foo(kek: 123, lol: "Hello, world!");
}
`.trim()

const regexps = [
    /(?<$ignore>^[ \t\n]$)/,

    /(?<string>(\"([^\\\"]|\\.)*\"))/,

    /(?<keyword>(\b(pub|const|type|enum|struct|trait|static|func|party)\b))/,
    /(?<keyword>(\b(else)\b))/,
    /(?<keyword>\b(break|continue|elif|if|in|for|loop|match|return|while)\b)/,
    /(?<keyword>(_))/,

    /(?<modifier>\b(mut)\b)/,
    /(?<modifier>\b(ref)\b)/,

    /(?<terminator>(;))/,
    /(?<separator>(,))/,    
    /(?<punctuation>(::|\{|\}|\(|\)|\[|\]))/,

    /(?<operator>(\+=|-=|\/=|\*=|%=|\^=|&=|\\|=|<<=|>>=|=))/,
    /(?<operator>(<=|>=|<|>|==|!=))/,
    /(?<operator>(!|\+(?!\+)|-(?!-)|\/|\*|%|\^|\&|\||<<|>>))/,
    /(?<operator>\b(and|or)\b)/,
    /(?<operator>:(?!:))/,

    /(?<constant>\b(true|false)\b)/,
    /(?<constant>(([0-9][0-9_]*)(?:([ui](?:8|16|32|64|128)|i|u))?))/,
    /(?<constant>((0x[a-fA-F0-9_]+)(?:([ui](?:8|16|32|64|128)|i|u))?))/,
    /(?<constant>((0o[0-7_]+)(?:([ui](?:8|16|32|64|128)|i|u))?))/,
    /(?<constant>((0b[01_]+)(?:([ui](?:8|16|32|64|128)|i|u))?))/,
    /(?<constant>(([0-9][0-9_]*\.[0-9][0-9_]*)))/,
    /(?<constant>(([0-9][0-9_]*(?:\.[0-9][0-9_]*)?)(f32|f64|f|d)))/,
    /(?<constant>(([0-9][0-9_]*(?:\.[0-9][0-9_]*)?[eE][+-]?[0-9_]+)(f32|f64|f|d)?))/,

    /(?<type>([A-Z][a-zA-Z0-9_]+))/,
    /(?<type>\b(bool|char|[ui](?:8|16|32|64|128)|f(?:1…|128)|int|uint|str|String|Self|Option|Result)\b)/,

    /(?<func>([\w_]+)(?=\())/,
    /(?<variable>(\w+))/,
    /(?<other>(\W))/
]

const fullRegex = new RegExp(Object.values(regexps).map(r => {
    if (Array.isArray(r)) {
        for (const subr of r) {
            return subr.source
        }
    } else {
        return r.source
    }
}).join('|'), 'g')

const tmpl = (rule, m) => {
    if (rule === '$ignore') {
        return m
    }
    return `
<span class="${rule}">${m}</span>
    `.trim()
}

const process = (src, theme) => {
    const hl = src.replace(fullRegex, (m, ...args) => {
        // console.log(m, ...args);
        // m = args.slice(0, args.length - 2).filter(el => !!el)[0]
        // if (!m) {
        // throw new Error('wtf')
        // }
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
