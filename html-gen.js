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

    /(?<keyword_other>(\b(pub|const|type|enum|struct|trait|static|func|party|else)\b))/,
    // /(?<keyword_else>(\b(else)\b))/,
    /(?<keyword_control>\b(break|continue|elif|if|in|for|loop|match|return|while)\b)/,
    /(?<keyword_underscore>(_))/,

    /(?<modifier_mut>\b(mut)\b)/,
    /(?<modifier_ref>\b(ref)\b)/,

    // /(?<func>(\w+))(?\()/,

    /(?<terminator>(;))/,
    /(?<separator>(,))/,    
    /(?<punctuation>(::|\{|\}|\(|\)|\[|\]))/,

    /(?<operator_assign>(\+=|-=|\/=|\*=|%=|\^=|&=|\\|=|<<=|>>=|=))/,
    /(?<operator_cmp>(<=|>=|<|>|==|!=))/,
    /(?<operator_math>(!|\+(?!\+)|-(?!-)|\/|\*|%|\^|\&|\||<<|>>))/,
    /(?<operator_logic>\b(and|or)\b)/,
    /(?<operator_punctuation>:(?!:))/,

    /(?<constant_bool>\b(true|false)\b)/,
    /(?<constant_dec>(([0-9][0-9_]*)(?:([ui](?:8|16|32|64|128)|i|u))?))/,
    /(?<constant_hex>((0x[a-fA-F0-9_]+)(?:([ui](?:8|16|32|64|128)|i|u))?))/,
    /(?<constant_oct>((0o[0-7_]+)(?:([ui](?:8|16|32|64|128)|i|u))?))/,
    /(?<constant_bin>((0b[01_]+)(?:([ui](?:8|16|32|64|128)|i|u))?))/,
    /(?<constant_float>(([0-9][0-9_]*\.[0-9][0-9_]*)))/,
    /(?<constant_float_suffix>(([0-9][0-9_]*(?:\.[0-9][0-9_]*)?)(f32|f64|f|d)))/,
    /(?<constant_float_exp>(([0-9][0-9_]*(?:\.[0-9][0-9_]*)?[eE][+-]?[0-9_]+)(f32|f64|f|d)?))/,

    /(?<type_word>([A-Z][a-zA-Z0-9_]+))/,
    /(?<type_builtin>\b(bool|char|[ui](?:8|16|32|64|128)|f(?:1…|128)|int|uint|str|String|Self|Option|Result)\b)/,

    /(?<variable>(\w+))/,
    /(?<other>(\W))/
]

const fullRegex = new RegExp(Object.values(regexps).map(r => r.source).join('|'), 'g')

const tmpl = (rule, m) => {
    if (rule === '$ignore') {
        return m
    }
    let classes = []
    let prefix = []
    for (const seg of rule.split('_')) {
        classes.push([...prefix, seg].join('.'))
        prefix.push(seg)
    }
    return `
<span class="${classes.join(' ')}">${m}</span>
    `.trim()
}

const process = (src, theme) => {
    const hl = src.replace(fullRegex, (m, ...args) => {
        // console.log(m);
        // m = args.slice(0, args.length - 2).filter(el => !!el)[0]
        // if (!m) {
        // throw new Error('wtf')
        // }
        for (const regex of regexps) {
            // !Array.isArray(regex) && console.log(`check '${m}' for`, rule, regex)
            const match = m.match(regex)
            if (!match) {
                continue
            }


            const rule = Object.keys(match.groups)[0]
            const str =  match.groups[rule]

            console.log(rule, `'${str}'`, match);

            if (!rule) {
                throw new Error('Wtf 2.0')
            }

            return tmpl(rule, str)
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
