import { LanguageSupport, StreamLanguage } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

const VAAB_KEYWORDS =
  /\b(let|changing|to|factory|fail|type|cast|entertains|choice|ability|can|match|when|then|return|if|else|or|fails|success|failure|otherwise|print|serve|route|socket|reply|yes|no|nothing|for|each|in|while|import|from|need|riff|together|start|shared|returns|with|new|and|not|file|text|json|pure|send|receive|select|timeout|after|seconds|milliseconds|expecting|as|try|at|port|get|post|of|size|found|self|sleep|every|transaction|where_eq|where_not|where_gt|where_gte|where_lt|where_lte|where_like|equals|differs|where|is|order_desc|order|limit|offset|all|first|count|insert|update|delete|row|connect|open|execute|query)\b/

const VAAB_TYPES =
  /\b(Text|Int|Float|Bool|List|Map|Channel|Task|Shared|Clock|Bytes|Socket|Hub|Json|JsonError|BytesError|SocketError|Http|HttpError|Sqlite|Env|Nothing|Self|Unit|Result|Db|Store|Logger|FileError|DbError|StoreError|LogError)\b/

const vaabLanguage = StreamLanguage.define({
  name: 'vaab',
  token(stream) {
    if (stream.eatSpace()) return null

    if (stream.match(/#.*/)) return 'comment'

    if (stream.match(/"([^"\\]|\\.)*"/)) return 'string'

    if (stream.match(VAAB_KEYWORDS)) return 'keyword'

    if (stream.match(VAAB_TYPES)) return 'typeName'

    if (stream.match(/\b\d+\.\d+\b/)) return 'number'

    if (stream.match(/\b\d+\b/)) return 'number'

    if (stream.match(/[+\-*/%=<>!&|?:]+/)) return 'operator'

    if (stream.match(/[a-zA-Z_]\w*/)) return 'variableName'

    stream.next()
    return null
  },
  tokenTable: {
    comment: t.lineComment,
    keyword: t.keyword,
    string: t.string,
    number: t.number,
    typeName: t.typeName,
    operator: t.operator,
    variableName: t.variableName,
  },
})

export const vaabLanguageSupport = new LanguageSupport(vaabLanguage)
