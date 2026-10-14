export type Example = {
  id: string
  label: string
  description: string
  source: string
}

export const EXAMPLES: Example[] = [
  {
    id: 'hello',
    label: 'Hello',
    description: 'The smallest Vaab program',
    source: `# The smallest Vaab program.
let name = "world"
print("hello, {name}")`,
  },
  {
    id: 'collections',
    label: 'Collections',
    description: 'Lists, maps, and functional style',
    source: `let numbers = [1, 2, 3]
let ages = {"Ada": 36, "Alan": 41}

print(numbers.map(n -> n * n))
print(ages.get("Ada") otherwise 0)`,
  },
  {
    id: 'casts',
    label: 'Casts',
    description: 'Mutable objects, inheritance, and errors',
    source: `cast Animal {
    changing name: Text

    speak() returns Text = self.name
}

cast Dog entertains Animal {
    changing breed: Text

    speak() returns Text = "{self.name}, a {self.breed}"
}

let ada = Dog.new(name: "Ada", breed: "collie")
print(ada.speak())`,
  },
  {
    id: 'query',
    label: 'Query',
    description: 'Fluent Db and Store relations',
    source: `demo() returns Text or fails DbError {
    let db = try Db.connect("sqlite::memory:")
    let empty: [Text] = []
    try db.execute("create table tasks (id text, owner text)", empty)
    try db.from("tasks").insert({"id": "1", "owner": "ada"})
    let rows = try db
        .from("tasks")
        .where("owner").is("ada")
        .order_desc("id")
        .all()
    return "ada has {rows.count} tasks"
}

match demo() {
    when success message then print(message)
    when failure error then match error {
        when Failed(message) then print(message)
    }
}`,
  },
  {
    id: 'logging',
    label: 'Logging',
    description: 'Levels, formats, and structured fields',
    source: `log.info("no setup needed")

let mem = Logger.memory()
mem.set_level("debug")
mem.set_format("json")
mem.write("warn", "slow query", {"ms": "42", "table": "tasks"})

for each line in mem.lines {
    print(line)
}`,
  },
  {
    id: 'numbers',
    label: 'Numbers',
    description: 'Means, z-scores, and the clock',
    source: `let samples = [2.0, 4.0, 4.0, 4.0, 5.0, 5.0, 7.0, 9.0]
let mean = samples.mean() otherwise 0.0
let window = [5.0, 7.0, 9.0]
print((window.mean() otherwise 0.0).round())

let z = (9.0 - mean) / 2.0
print(z.round())
print(if Clock.millis() > 0 { "yes" } else { "no" })`,
  },
  {
    id: 'json',
    label: 'JSON',
    description: 'Decode a record, or walk an unknown document',
    source: `type Note {
    title: Text
    tags: list of Text
    hint: maybe Text
}

let payload = "\\{\\"title\\":\\"packing list\\",\\"tags\\":[\\"travel\\",\\"home\\"]\\}"

show(text: Text) returns Text or fails JsonError {
    let note = try from_json(text, as: Note)
    print(note.title)
    let doc = try Json.parse(text)
    let tags = doc.at("tags").as_list() otherwise []
    print(tags.first.as_text() otherwise "")
    print(note.hint otherwise "none")
    return "ok"
}

match show(payload) {
    when success _ then {}
    when failure error then match error {
        when Failed(message) then print(message)
    }
}`,
  },
  {
    id: 'bytes',
    label: 'Bytes',
    description: 'Little-endian reads that fail softly',
    source: `demo() returns Int or fails BytesError {
    let payload = try Bytes.from_hex(
        "010000002a0000000000000001f9ffffffffffffff03000000416461"
    )
    print(try payload.u32_le(at: 0))
    print(try payload.u64_le(at: 4))
    print(try payload.bool(at: 12))
    match try payload.borsh_text(at: 21) {
        when (name, _) then print(name)
    }
    return 0
}

match demo() {
    when success _ then {}
    when failure error then match error {
        when OutOfRange(at, length) then print("out of range {at} of {length}")
        when TooLarge(at) then print("too large at {at}")
        when Invalid(message) then print(message)
    }
}`,
  },
  {
    id: 'match',
    label: 'Match',
    description: 'Pattern matching on choices',
    source: `choice Mood {
    Bright
    Cloudy
    Stormy
}

describe(m: Mood) returns Text {
    match m {
        when Bright then "sun on your face"
        when Cloudy then "soft light through glass"
        when Stormy then "rain on the roof"
    }
}

print(describe(Mood.Bright))`,
  },
]

export const DEFAULT_SOURCE = EXAMPLES[0]!.source
