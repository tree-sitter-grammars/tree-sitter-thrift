module.exports = grammar({
  name: "thrift",

  extras: ($) => [/\s|\\\r?\n/, $.comment],

  word: ($) => $.identifier,

  rules: {
    document: ($) => seq(repeat($.header), repeat($.definition)),

    header: ($) => choice($.include, $.cpp_include, $.namespace),

    include: ($) => seq("include", $.literal),

    cpp_include: ($) => seq("cpp_include", $.literal),

    namespace: ($) => seq("namespace", $.namespace_scope, $.identifier, optional($.namespace_uri)),

    namespace_scope: () =>
      choice(
        "*",
        "c_glib",
		"cl",
        "cpp",
		"cpp.noexist",
        "d",
        "dart",
        "delphi",
        "erl",
        "go",
        "haxe",
        "java",
        "javame",
        "js",
        "kotlin",
        "lua",
        "netstd",
        "nodejs",
        "nodets",
		"noexist",
        "ocaml",
        "perl",
        "php",
        "py",
        "py.twisted",
        "rb",
        "rs",
		"smalltalk.category",
        "st",
        "swift",
        "ts",
        "xsd"
      ),

	namespace_uri: ($) => seq("(", "uri", "=", field("uri", $.literal), ")"),

    definition: ($) =>
      choice(
        $.const,
        $.typedef,
        $.enum,
        $.senum,
        $.struct,
        $.union,
        $.exception,
        $.service
      ),

    const: ($) =>
      seq(
        "const",
        $.field_type,
        $.identifier,
        "=",
        $.const_value,
        optional($.list_separator)
      ),

    typedef: ($) => seq("typedef", $.definition_type, $.identifier),

    enum: ($) =>
      seq(
        "enum",
        $.identifier,
        "{",
        repeat(
          seq(
            $.identifier,
            optional(seq("=", $.int_constant)),
            optional($.list_separator)
          )
        ),
        "}"
      ),

    senum: ($) =>
      seq(
        "senum",
        $.identifier,
        "{",
        repeat(seq($.literal, optional($.list_separator))),
        "}"
      ),

    struct: ($) =>
      seq(
        "struct",
        $.identifier,
        optional("xsd_all"),
        "{",
        repeat(choice($.field, $.recursive_field)),
        "}",
      ),

    union: ($) =>
      seq(
        "union",
        $.identifier,
        optional("xsd_all"),
        "{",
        repeat($.field),
        "}"
      ),

    exception: ($) => seq("exception", $.identifier, "{", repeat($.field), "}"),

    service: ($) =>
      seq(
        "service",
        $.identifier,
        optional(seq("extends", $.identifier)),
        "{",
        repeat($.function),
        "}"
      ),

    field: ($) =>
      seq(
        optional($.field_id),
        optional($.field_req),
        $.field_type,
        $.identifier,
        optional(seq("=", $.const_value)),
        optional("xsd_optional"),
        optional("xsd_nillable"),
        optional($.xsd_attrs),
        optional($.list_separator)
      ),

	recursive_field: ($) => 
	  seq(
		optional($.field_id),
		optional($.field_req),
		$.field_type,
		"&",
		$.identifier,
	  ),

    field_id: ($) => seq($.int_constant, ":"),

    field_req: ($) => choice("required", "optional"),

    xsd_attrs: ($) => seq("xsd_attrs", "{", repeat($.field), "}"),

    function: ($) =>
      seq(
        optional("oneway"),
        $.function_type,
        $.identifier,
        "(",
        repeat($.field),
        ")",
        optional($.throws),
        optional($.list_separator)
      ),

    function_type: ($) => choice($.field_type, "void"),

    throws: ($) => seq("throws", "(", repeat($.field), ")"),

    field_type: ($) => choice($.identifier, $.base_type, $.container_type),

    definition_type: ($) => choice($.base_type, $.container_type, $.custom_type),

    base_type: () =>
      choice(
        "bool",
        "byte",
        "i8",
        "i16",
        "i32",
        "i64",
        "double",
        "string",
        "binary",
        "slist"
      ),

    container_type: ($) => choice($.map_type, $.set_type, $.list_type),

    map_type: ($) =>
      seq(
        "map",
        optional($.cpp_type),
        "<",
        $.field_type,
        ",",
        $.field_type,
        ">"
      ),

    set_type: ($) => seq("set", optional($.cpp_type), "<", $.field_type, ">"),

    list_type: ($) => seq("list", "<", $.field_type, ">", optional($.cpp_type)),

    cpp_type: ($) => choice("cpp_type", $.literal),

	custom_type: ($) => $.identifier,

    const_value: ($) =>
      choice(
        $.int_constant,
        $.double_constant,
        $.literal,
        $.identifier,
        $.const_list,
        $.const_map
      ),

    int_constant: () => /[+-]?(0x)?[0-9a-fA-F]+/,

    double_constant: () => /[+-]?(\d+(\.\d+)?|\.\d+)([Ee][+-]?\d+)?/,

    const_list: ($) =>
      seq("[", repeat(seq($.const_value, optional($.list_separator))), "]"),

    const_map: ($) =>
      seq(
        "{",
        repeat(
          seq($.const_value, ":", $.const_value, optional($.list_separator))
        ),
        "}"
      ),

    literal: () => /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/,

    identifier: () => /[A-Za-z_][A-Za-z0-9._]*/,

    st_identifier: () => /[A-Za-z_][A-Za-z0-9._-]*/,

    list_separator: () => choice(",", ";"),

    // http://stackoverflow.com/questions/13014947/regex-to-match-a-c-style-multiline-comment/36328890#36328890
    comment: () =>
      token(
        choice(
          seq("#", /(\\(.|\r?\n)|[^\\\n])*/),
          seq("//", /(\\(.|\r?\n)|[^\\\n])*/),
          seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")
        )
      ),
  },
});
