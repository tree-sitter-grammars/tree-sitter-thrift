/* eslint-disable camelcase */

const list_seq = (rule, separator, trailing_separator = false) =>
  trailing_separator ?
    seq(rule, repeat(seq(separator, rule)), optional(separator)) :
    seq(rule, repeat(seq(separator, rule)));

const primitives = ['binary', 'bool', 'byte', 'i8', 'i16', 'i32', 'i64', 'double', 'string', 'slist'];

const invalid = [
  'BEGIN',
  'END',
  '__CLASS__',
  '__DIR__',
  '__FILE__',
  '__FUNCTION__',
  '__LINE__',
  '__METHOD__',
  '__NAMESPACE__',
  'abstract',
  'alias',
  'and',
  'args',
  'as',
  'assert',
  'begin',
  'break',
  'case',
  'catch',
  'class',
  'clone',
  'continue',
  'declare',
  'def',
  'default',
  'del',
  'delete',
  'do',
  'dynamic',
  'elif',
  'else',
  'elseif',
  'elsif',
  'end',
  'enddeclare',
  'endfor',
  'endforeach',
  'endif',
  'endswitch',
  'endwhile',
  'ensure',
  'except',
  'exec',
  'finally',
  'float',
  'for',
  'foreach',
  'from',
  'function',
  'global',
  'goto',
  'if',
  'implements',
  'import',
  'in',
  'inline',
  'instanceof',
  'interface',
  'is',
  'lambda',
  'module',
  'native',
  'new',
  'next',
  'nil',
  'not',
  'or',
  'package',
  'pass',
  'print',
  'private',
  'protected',
  'public',
  'raise',
  'redo',
  'rescue',
  'retry',
  'register',
  'return',
  'self',
  'sizeof',
  'static',
  'super',
  'switch',
  'synchronized',
  'then',
  'this',
  'throw',
  'transient',
  'try',
  'undef',
  'unless',
  'unsigned',
  'until',
  'use',
  'var',
  'virtual',
  'volatile',
  'when',
  'while',
  'with',
  'xor',
  'yield',
];

module.exports = grammar({
  name: 'thrift',

  extras: ($) => [/\s|\\\r?\n/, $.comment, $.invalid],

  word: ($) => $.identifier,

  rules: {
    document: ($) => seq(repeat($.header), repeat($.definition)),

    header: ($) => choice($.include, $.cpp_include, $.namespace),

    include: ($) => seq('include', $.include_path),

    cpp_include: ($) => seq('cpp_include', $.include_path),

    namespace: ($) => seq('namespace', $.namespace_scope, $.identifier, optional($.namespace_uri)),

    namespace_scope: () =>
      choice(
        '*',
        'c_glib',
        'cl',
        'cpp',
        'cpp.noexist',
        'd',
        'dart',
        'delphi',
        'erl',
        'go',
        'haxe',
        'java',
        'javame',
        'js',
        'kotlin',
        'lua',
        'netstd',
        'nodejs',
        'nodets',
        'noexist',
        'ocaml',
        'perl',
        'php',
        'py',
        'py.twisted',
        'rb',
        'rs',
        'smalltalk.category',
        'st',
        'swift',
        'ts',
        'xsd',
      ),

    namespace_uri: ($) => seq('(', 'uri', '=', field('uri', $.string_literal), ')'),

    definition: ($) =>
      choice(
        $.const,
        $.typedef,
        $.enum,
        $.senum,
        $.struct,
        $.union,
        $.exception,
        $.service,
      ),

    const: ($) =>
      seq(
        'const',
        $.field_type,
        $.identifier,
        '=',
        $.const_value,
        optional($.annotation),
        optional($.list_separator),
      ),

    typedef: ($) => seq('typedef', $.definition_type, optional($.annotation), $.identifier, optional($.annotation), optional($.list_separator)),

    enum: ($) =>
      seq(
        'enum',
        $.identifier,
        '{',
        repeat(
          seq(
            $.identifier,
            optional(seq('=', $.int_constant)),
            optional($.annotation),
            optional($.list_separator),
          ),
        ),
        '}',
        optional($.annotation),
      ),

    senum: ($) =>
      seq(
        'senum',
        $.identifier,
        '{',
        repeat(seq($.string_literal, optional($.list_separator))),
        '}',
      ),

    struct: ($) =>
      seq(
        'struct',
        $.identifier,
        optional('xsd_all'),
        '{',
        repeat(choice($.field, $.recursive_field)),
        '}',
        optional($.annotation),
      ),

    union: ($) =>
      seq(
        'union',
        $.identifier,
        optional('xsd_all'),
        '{',
        repeat($.field),
        '}',
      ),

    exception: ($) => seq('exception', $.identifier, '{', repeat($.field), '}', optional($.annotation)),

    service: ($) =>
      seq(
        'service',
        $.identifier,
        optional(seq('extends', $.identifier)),
        '{',
        repeat($.function),
        '}',
        optional($.annotation),
      ),

    field: ($) =>
      seq(
        optional($.field_id),
        optional($.field_req),
        $.field_type,
        $.identifier,
        optional(seq('=', $.const_value)),
        optional('xsd_optional'),
        optional('xsd_nillable'),
        optional($.xsd_attrs),
        optional($.annotation),
        optional($.list_separator),
      ),

    recursive_field: ($) =>
      seq(
        optional($.field_id),
        optional($.field_req),
        $.field_type,
        '&',
        $.identifier,
      ),

    field_id: ($) => seq($.int_constant, ':'),

    field_req: () => choice('required', 'optional'),

    xsd_attrs: ($) => seq('xsd_attrs', '{', repeat($.field), '}'),

    function: ($) =>
      seq(
        optional('oneway'),
        $.function_type,
        $.identifier,
        '(',
        repeat($.field),
        ')',
        optional($.throws),
        optional($.annotation),
        optional($.list_separator),
      ),

    function_type: ($) => choice($.field_type, 'void'),

    throws: ($) => seq('throws', '(', repeat($.field), ')'),

    field_type: ($) => choice($.identifier, $.primitive_type, $.container_type),

    definition_type: ($) => choice($.primitive_type, $.container_type, $.custom_type),

    primitive_type: () => choice(...primitives),

    container_type: ($) => choice($.map_type, $.set_type, $.list_type),

    map_type: ($) =>
      seq(
        'map',
        optional($.cpp_type),
        '<',
        $.field_type,
        optional($.annotation),
        ',',
        $.field_type,
        '>',
      ),

    set_type: ($) => seq('set', optional($.cpp_type), '<', $.field_type, optional($.annotation), '>'),

    list_type: ($) => seq('list', '<', $.field_type, optional($.annotation), '>', optional($.cpp_type)),

    cpp_type: ($) => choice('cpp_type', $.string_literal),

    annotation: ($) =>
      seq(
        '(',
        list_seq(seq($.language_annotation, optional(seq('=', field('value', $.string_literal)))), ',', true),
        ')',
      ),

    language_annotation: ($) => field('language_specific_type', $.identifier),

    annotation_lang: () =>
      choice(
        'cpp',
        'java',
        'python',
      ),

    custom_type: ($) => $.identifier,

    const_value: ($) =>
      choice(
        $.int_constant,
        $.double_constant,
        $.string_literal,
        $.identifier,
        $.const_list,
        $.const_map,
      ),

    int_constant: () => /[+-]?(0x)?[0-9a-fA-F]+/,

    double_constant: () => /[+-]?(\d+(\.\d+)?|\.\d+)([Ee][+-]?\d+)?/,

    const_list: ($) =>
      seq('[', repeat(seq($.const_value, optional($.list_separator))), ']'),

    const_map: ($) =>
      seq(
        '{',
        repeat(
          seq($.const_value, ':', $.const_value, optional($.list_separator)),
        ),
        '}',
      ),

    string_literal: () => /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/,

    include_path: ($) => $.string_literal,

    identifier: () => /[A-Za-z_][A-Za-z0-9._]*/,

    st_identifier: () => /[A-Za-z_][A-Za-z0-9._-]*/,

    list_separator: () => choice(',', ';'),

    // http://stackoverflow.com/questions/13014947/regex-to-match-a-c-style-multiline-comment/36328890#36328890
    comment: () =>
      token(
        choice(
          seq('#', /(\\(.|\r?\n)|[^\\\n])*/),
          seq('//', /(\\(.|\r?\n)|[^\\\n])*/),
          seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/'),
        ),
      ),

    invalid: () => choice(...invalid),
  },
});
