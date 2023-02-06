/**
 * @file Thrift grammar for tree-sitter
 * @author Amaan Qureshi <amaanq12@gmail.com>
 * @author Campbell He <campbell.he@icloud.com>
 * @license MIT
 * @see {@link https://thrift.apache.org|official website}
 * @see {@link https://thrift.apache.org/docs/idl.html|official syntax spec}
 * @see {@link http://diwakergupta.github.io/thrift-missing-guide|unofficial but comprehensive guide}
 */

/* eslint-disable arrow-parens */
/* eslint-disable camelcase */
/* eslint-disable-next-line spaced-comment */
/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

/**
* Creates a rule to match one or more of the rules separated by the separator
* and optionally adds a trailing separator (default is false).
*
* @param {Rule} rule
* @param {string} separator - The separator to use.
* @param {boolean?} trailing_separator - The trailing separator to use.
*
* @return {SeqRule}
*
*/
const list_seq = (rule, separator, trailing_separator = false) =>
  trailing_separator ?
    seq(rule, repeat(seq(separator, rule)), optional(separator)) :
    seq(rule, repeat(seq(separator, rule)));

const primitives = ['binary', 'bool', 'byte', 'i8', 'i16', 'i32', 'i64', 'double', 'string', 'slist'];

const namespace_languages = [
  'as3',
  'c_glib',
  'cl',
  'cocoa',
  'cpp',
  'cpp2',
  'cpp.noexist',
  'csharp',
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
  'netcore',
  'netstd',
  'nodejs',
  'nodets',
  'noexist',
  'ocaml',
  'perl',
  'php',
  'php.path',
  'py',
  'py.twisted',
  'rb',
  'rs',
  'smalltalk.prefix',
  'smalltalk.category',
  'st',
  'swift',
  'ts',
  'xml',
  'xsd',

  // The following are deprecated and should not really be used, but are added for legacy code
  'cocoa_prefix',
  'cpp_namespace',
  'csharp_namespace',
  'delphi_namespace',
  'java_package',
  'perl_package',
  'php_namespace',
  'py_module',
  'ruby_namespace',
  'smalltalk_category',
  'smalltalk_prefix',
  'xsd_namespace',
];

// Facebook/Twitter uses these
const namespace_languages_ext = [
  'android',
  'hack',
  'hs',
  'hs2',
  'java.swift',
  'java.swift.constants',
  'json',
  'py.asyncio',
  'py3',
  'rust',
  'scala',
];

// Commented invalids are ones to have been found used by fbthrift, and so have been removed
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
  // 'default',
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
  // 'float',
  'for',
  'foreach',
  // 'from',
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
  // 'module',
  'native',
  'new',
  // 'next',
  // 'nil',
  'not',
  'or',
  // 'package',
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
  // 'return',
  'self',
  'sizeof',
  'static',
  // 'super',
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

  extras: $ => [/\s|\\\r?\n/, $.comment, $.invalid],

  word: $ => $.identifier,

  inline: $ => [
    $._annotation_identifier,
    $._const_identifier,
    $._enum_identifier,
    $._enum_member,
    $._exception_identifier,
    $._field_identifier,
    $._function_identifier,
    $._param_identifier,
    $._exception_param_identifier,
    $._type_identifier,

    $._return_type,
  ],

  rules: {
    document: $ => seq(repeat($.header), repeat($.definition)),

    header: $ => choice($.include, $.cpp_include, $.namespace, $.package),

    include: $ => seq('include', alias($.string, $.include_path)),

    cpp_include: $ => seq('cpp_include', alias($.string, $.include_path)),

    package: $ => seq(
      repeat($.fb_annotation),
      'package',
      alias($.string, $.package_path),
    ),

    namespace: $ =>
      seq(
        'namespace',
        // choice($.namespace_scope, alias($.identifier, $.namespace_scope)),
        $.namespace_scope,
        alias(choice($.identifier, $.string), $.namespace_definition),
        optional($.namespace_uri),
        optional(';'),
      ),

    namespace_scope: _ => choice('*', ...namespace_languages, ...namespace_languages_ext),

    annotation_scope: _ => choice(...namespace_languages),

    namespace_uri: $ => seq('(', alias('uri', $.uri_def), '=', alias($.string, $.uri), ')'),

    definition: $ =>
      choice(
        $.const,
        $.typedef,
        $.enum,
        $.senum,
        $.struct,
        $.union,
        $.exception,
        $.service,
        $.interaction,
      ),

    typedef: $ =>
      seq(
        repeat($.fb_annotation),
        'typedef',
        $.definition_type,
        optional($.annotation),
        alias($.identifier, $.typedef_definition),
        optional($.annotation),
        optional($.list_separator),
      ),

    const: $ =>
      seq(
        repeat($.fb_annotation),
        'const',
        $.field_type,
        $._const_identifier,
        '=',
        $.const_value,
        optional($.annotation),
        optional($.list_separator),
      ),

    enum: $ =>
      seq(
        repeat($.fb_annotation),
        'enum',
        $._enum_identifier,
        '{',
        repeat(
          seq(
            repeat($.fb_annotation),
            $._enum_member,
            optional(seq('=', $.number)),
            optional($.annotation),
            optional($.list_separator),
          ),
        ),
        '}',
        optional($.annotation),
      ),

    senum: $ =>
      seq(
        'senum',
        $._type_identifier,
        '{',
        repeat(seq($.string, optional($.list_separator))),
        '}',
      ),

    struct: $ =>
      seq(
        repeat($.fb_annotation),
        'struct',
        $._type_identifier,
        optional('xsd_all'),
        '{',
        repeat(choice($.field, $.recursive_field)),
        '}',
        optional($.annotation),
      ),

    union: $ =>
      seq(
        repeat($.fb_annotation),
        'union',
        $._type_identifier,
        optional('xsd_all'),
        '{',
        repeat($.field),
        '}',
        optional($.annotation),
      ),

    exception: $ =>
      seq(
        repeat($.fb_annotation),
        repeat($.exception_modifier),
        'exception',
        $._exception_identifier,
        '{',
        repeat($.field),
        '}',
        optional($.annotation),
      ),
    exception_modifier: _ => choice('client', 'permanent', 'server', 'safe', 'stateful', 'transient'),

    service: $ =>
      seq(
        repeat($.fb_annotation),
        'service',
        $._type_identifier,
        optional(seq('extends', $._type_identifier)),
        '{',
        repeat(choice(seq('performs', $._type_identifier, ';'), $.function)),
        '}',
        optional($.annotation),
      ),

    // Facebook-specific
    interaction: $ =>
      seq(
        'interaction',
        $._type_identifier,
        '{',
        repeat($.function),
        '}',
        optional($.annotation),
      ),

    field: $ =>
      seq(
        repeat($.fb_annotation),
        optional($.field_id),
        optional($.field_modifier),
        $.field_type,
        optional($.annotation),
        $._field_identifier,
        optional(seq('=', $.const_value)),
        optional('xsd_optional'),
        optional('xsd_nillable'),
        optional($.xsd_attrs),
        optional($.annotation),
        optional($.list_separator),
      ),
    recursive_field: $ =>
      seq(
        optional($.field_id),
        optional($.field_modifier),
        $.field_type,
        '&',
        $.identifier,
      ),
    field_id: $ => seq($.number, ':'),
    field_modifier: _ => choice('required', 'optional'),

    xsd_attrs: $ => seq('xsd_attrs', '{', repeat($.field), '}'),

    // Functions
    function: $ =>
      seq(
        repeat($.fb_annotation),
        optional($.function_modifier),
        list_seq($.return_type, ','),
        optional($.annotation),
        $._function_identifier,
        $.function_parameters,
        optional($.throws),
        optional($.annotation),
        optional($.list_separator),
      ),
    function_modifier: _ => choice('async', 'oneway', 'readonly', 'idempotent'), // async is deprecated
    return_type: $ => choice($.field_type, 'void'),
    function_parameters: $ => seq('(', repeat($.function_parameter), ')'),
    function_parameter: $ => seq(
      repeat($.fb_annotation),
      optional($.field_id),
      optional($.field_modifier),
      alias($.field_type, $.param_type),
      optional($.annotation),
      $._param_identifier,
      optional(seq('=', $.const_value)),
      optional('xsd_optional'),
      optional('xsd_nillable'),
      optional($.xsd_attrs),
      optional($.annotation),
      optional($.list_separator),
    ),

    // Exceptions
    throws: $ => seq('throws', $.exception_parameters),
    exception_parameters: $ => seq('(', repeat($.exception_parameter), ')'),
    exception_parameter: $ => seq(
      optional($.field_id),
      optional($.field_modifier),
      alias($.field_type, $.exception_param_type),
      $._exception_param_identifier,
      optional(seq('=', $.const_value)),
      optional('xsd_optional'),
      optional('xsd_nillable'),
      optional($.xsd_attrs),
      optional($.annotation),
      optional($.list_separator),
    ),

    field_type: $ => choice($.identifier, $.primitive, $.container_type),

    definition_type: $ => choice($.primitive, $.container_type, $.custom_type),

    primitive: _ => choice(...primitives),

    container_type: $ => choice($.list, $.map, $.set, $.stream, $.sink),
    list: $ => prec.left(
      seq(
        'list',
        '<',
        $.field_type,
        optional($.annotation),
        '>',
        optional($.annotation),
        optional($.cpp_type),
      ),
    ),
    map: $ => prec.left(
      seq(
        'map',
        optional($.cpp_type),
        '<',
        $.field_type,
        optional($.annotation),
        ',',
        $.field_type,
        optional($.annotation),
        '>',
        optional($.annotation),
      ),
    ),
    set: $ => prec.left(
      seq(
        'set',
        optional($.cpp_type),
        '<',
        $.field_type,
        optional($.annotation),
        '>',
        optional($.annotation),
      ),
    ),
    stream: $ => prec.left(
      seq(
        'stream',
        '<',
        $.field_type,
        // optional($.annotation),
        optional($.throws),
        '>',
        // optional($.annotation),
      ),
    ),
    sink: $ => prec.left(
      seq(
        'sink',
        '<',
        $.field_type,
        optional($.annotation),
        optional($.throws),
        ',',
        $.field_type,
        optional($.annotation),
        optional($.throws),
        '>',
        // optional($.annotation),
      ),
    ),


    cpp_type: $ => choice('cpp_type', $.string),

    annotation: $ =>
      seq(
        '(',
        optional(
          list_seq(
            seq($.annotation_definition, optional(seq('=', alias($.const_value, $.annotation_value)))),
            ',',
            true,
          ),
        ),
        ')',
      ),
    // @scope.Field
    // @cpp.Ref{type = cpp.RefType.Unique}
    fb_annotation: $ => seq('@', $.fb_annotation_definition),

    annotation_definition: $ =>
      seq(
        $._annotation_identifier,
        repeat(seq('.', $._field_identifier)),
      ),
    // @python.Adapter{
    //   name = "my.module.Adapter2",
    //   typeHint = "my.another.module.AdaptedType2[]",
    // }
    fb_annotation_definition: $ =>
      seq(
        $._annotation_identifier,
        choice(
          repeat(seq('.', $._field_identifier)),
          seq(
            '{',
            repeat(
              seq(
                $._field_identifier,
                '=',
                $.const_value,
                optional(','),
              )),
            '}',
          ),
        ),
      ),

    custom_type: $ => $.identifier,

    const_value: $ =>
      choice(
        $.number,
        $.double,
        $.boolean,
        $.string,
        $._internal_const_identifier,
        $.const_list,
        $.const_map,
        $.const_struct,
      ),
    _internal_const_identifier: $ => prec.right(
      choice(
        seq(
          // Foo.Bar.Etc...
          repeat1(seq(alias($._identifier_no_period, $.type_identifier), '.')),
          // ... Baz
          alias($._identifier_no_period, $.const_identifier),
        ),
        alias($._identifier_no_period, $.const_identifier),
      ),
    ),

    numeric_operator: _ => choice('+', '-'),

    number: _ => {
      const hex_literal = seq(
        optional(choice('-', '+')),
        /0[xX]/,
        /[\da-fA-F](_?[\da-fA-F])*/,
      );

      const binary_literal = seq(
        optional(choice('-', '+')),
        /0[bB]/,
        /[01](_?[01])*/,
      );

      const decimal_digits = /\d(_?\d)*/;
      const signed_integer = seq(optional(choice('-', '+')), decimal_digits);

      const decimal_integer_literal = choice(
        '0',
        seq(optional('0'), /[1-9]/, optional(seq(optional('_'), decimal_digits))),
      );

      const decimal_literal = choice(
        seq(optional(choice('-', '+')), decimal_integer_literal),
        decimal_digits,
        signed_integer,
      );

      return token(choice(
        hex_literal,
        binary_literal,
        decimal_literal,
      ));
    },

    double: _ => /[+-]?(\d+(\.\d+)?|\.\d+)([Ee][+-]?\d+)?/,

    boolean: _ => choice('true', 'false'),

    const_list: $ =>
      seq('[', repeat(seq($.const_value, optional($.list_separator))), ']'),

    const_map: $ =>
      seq(
        '{',
        repeat(
          seq($.const_value, ':', $.const_value, optional($.list_separator)),
        ),
        '}',
      ),

    const_struct: $ =>
      seq(
        alias(
          choice(
            seq(
            // Foo.Bar.Etc...
              repeat1(seq(alias($._identifier_no_period, $.type_identifier), '.')),
              // ... Baz
              alias($._identifier_no_period, $.type_identifier),
            ),
            alias($._identifier_no_period, $.type_identifier),
          ),
          $.type_identifier,
        ),
        '{',
        repeat(seq($._field_identifier, '=', $.const_value, optional(','))),
        '}',
      ),

    // https://github.com/tree-sitter/tree-sitter-javascript/blob/master/grammar.js#L900-L945
    // Here we tolerate unescaped newlines in double-quoted and
    // single-quoted string literals.
    //
    string: $ => choice(
      seq(
        '"',
        repeat(choice(
          alias($.unescaped_double_string_fragment, $.string_fragment),
          $._escape_sequence,
        )),
        '"',
      ),
      seq(
        '\'',
        repeat(choice(
          alias($.unescaped_single_string_fragment, $.string_fragment),
          $._escape_sequence,
        )),
        '\'',
      ),
    ),

    // Workaround to https://github.com/tree-sitter/tree-sitter/issues/1156
    // We give names to the token_ constructs containing a regexp
    // so as to obtain a node in the CST.
    //
    unescaped_double_string_fragment: _ => token.immediate(prec(1, /[^"\\]+/)),

    // same here
    unescaped_single_string_fragment: _ => token.immediate(prec(1, /[^'\\]+/)),

    _escape_sequence: $ =>
      choice(
        prec(2, token.immediate(seq('\\', /[^abfnrtvxu'\"\\\?]/))),
        prec(1, $.escape_sequence),
      ),

    escape_sequence: _ => token.immediate(seq(
      '\\',
      choice(
        /[^xu0-7]/,
        /[0-7]{1,3}/,
        /x[0-9a-fA-F]{2}/,
        /u[0-9a-fA-F]{4}/,
        /u{[0-9a-fA-F]+}/,
      ))),

    identifier: _ => /[A-Za-z_][A-Za-z0-9._]*/,
    _identifier_no_period: _ => /[A-Za-z_][A-Za-z0-9_]*/,

    _annotation_identifier: $ => alias($.identifier, $.annotation_identifier),
    _const_identifier: $ => alias($.identifier, $.const_identifier),
    _enum_identifier: $ => alias($.identifier, $.enum_identifier),
    _enum_member: $ => alias($.identifier, $.enum_member),
    _exception_identifier: $ => alias($.identifier, $.exception_identifier),
    _field_identifier: $ => alias($.identifier, $.field_identifier),
    _function_identifier: $ => alias($.identifier, $.function_identifier),
    _param_identifier: $ => alias($.identifier, $.param_identifier),
    _exception_param_identifier: $ => alias($.identifier, $.exception_param_identifier),
    _type_identifier: $ => alias($.identifier, $.type_identifier),

    st_identifier: _ => /[A-Za-z_][A-Za-z0-9._-]*/,

    list_separator: _ => choice(',', ';'),

    // http://stackoverflow.com/questions/13014947/regex-to-match-a-c-style-multiline-comment/36328890#36328890
    comment: _ =>
      token(
        choice(
          seq('#', /(\\(.|\r?\n)|[^\\\n])*/),
          seq('//', /(\\(.|\r?\n)|[^\\\n])*/),
          seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/'),
        ),
      ),

    invalid: _ => choice(...invalid),
  },
});
