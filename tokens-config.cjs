function paramCase(name) {
  return name.replace(/([A-Z]|[0-9]+)/g, s => '-' + s.toLowerCase()).replace(/^-/, '')
}

function fdsType(token) {
  if ( token.name.startsWith("Color") ) {
    return "FdsColorToken";
  } else if ( token.name.startsWith("Size") ) {
    return "FdsSizeToken";
  } else {
    return "FdsToken";
  }
}

function fdsTokenString(token) {
  return `{ name: "fds-${paramCase(token.name)}", value: "${token.value}" }`;
}

function capitalize(word) {
  return `${word.charAt(0).toUpperCase()}${word.slice(1)}`
}

function uncapitalize(word) {
  return `${word.charAt(0).toLowerCase()}${word.slice(1)}`
}

function indent(size = 2) {
  return function(line) {
    return `${' '.repeat(size)}${line}`
  }
}

function getStylesForPropertyGroup(propertyGroup, classNameSuffix = '') {
  return Object.entries(propertyGroup).flatMap(([groupName, group]) => (
    Object.entries(group).map(([styleName, style]) => ({
      className: Array.from(
        new Set(
          [groupName, styleName, classNameSuffix]
            .join(' ')
            .split(' ')
        )
      )
        .join('-')
        .toLowerCase(),
      properties: Object.entries(style).map(([propertyName, { name }]) => ({ propertyName, fdsName: `Fds${name}` })),
    }))
  ))
}

function getExportedClassName(className, exportedNameSuffix = 'Class') {
  return `${
    uncapitalize(
      className
        .split('-')
        .map(capitalize)
        .join('')
    )
  }${exportedNameSuffix}`
}

module.exports = {
  source: ['src/tokens/**/*.json'],
  format: {
    'fds/typings': ({ dictionary }) => {
      const allType = dictionary
        .allTokens
        .map(token => fdsTokenString(token))
        .join(" | ");

      const colorType = dictionary.allTokens
        .filter(token => fdsType(token) === "FdsColorToken")
        .map(token => fdsTokenString(token))
        .join(" | ");

      const sizeType = dictionary.allTokens
        .filter(token => fdsType(token) === "FdsSizeToken")
        .map(token => fdsTokenString(token))
        .join(" | ");

      const tokens = dictionary
        .allTokens
        .map(token => `export const FdsToken${token.name}: ${fdsType(token)}`);

      return [
        `export type FdsToken = ${allType}`,
        `export type FdsColorToken = ${colorType}`,
        `export type FdsSizeToken = ${sizeType}`,
        tokens.join("\n")
      ].join("\n")
    },
    'fds/javascript': ({ dictionary }) => {
      return dictionary
        .allTokens
        .map(token => `export const FdsToken${token.name} = ${fdsTokenString(token)}`)
        .join("\n")
    },
    'fds/css-variables': ({ dictionary }) => {
      const variables = dictionary
        .allTokens
        .map(token => `  --fds-${token.name}: ${token.value}`)
        .join(";\n")

      return `:root {\n${variables}\n}`
    },
    'fds/style-template-typings': ({ dictionary }) => {
      const { Typography } = dictionary.properties
      const styles = getStylesForPropertyGroup(Typography, 'text')

      return [
        `import { CSSResult } from 'lit'\n`,
        `${styles.flatMap(style => [
          `// .${style.className}`,
          `export const ${getExportedClassName(style.className)}: CSSResult\n`
        ]).join('\n')}`
      ]
        .join('\n')
    },
    'fds/style-templates': ({ dictionary }) => {
      const { Typography } = dictionary.properties
      const styles = getStylesForPropertyGroup(Typography, 'text')

      return [
        'import {',
        styles
          .flatMap(style => style.properties.map(property => property.fdsName))
          .sort()
          .map(indent())
          .join(',\n'),
        `} from './style-properties.js'\n`,
        `import { css } from 'lit'\n`,
        ...styles
          .sort((a, b) => a.className.localeCompare(b.className))
          .map(style => (
            [
              `export const ${getExportedClassName(style.className)} = css\``,
              `  .${style.className} {`,
              style.properties
                .sort((a, b) => a.propertyName.localeCompare(b.propertyName))
                .map(({ propertyName, fdsName }) => `${propertyName}: \${${fdsName}};`)
                .map(indent(4))
                .join('\n'),
              '  }\n`\n'
            ]
              .join('\n')
        )),
      ]
        .join('\n')
    },
    'fds/style-property-typings': ({ dictionary }) => {
      const { allTokens } = dictionary

      return [
        `import { CSSResult } from 'lit'\n`,
        ...allTokens.map(({ name }) => `export const Fds${name}: CSSResult`),
        ''
      ]
        .join('\n')
    },
    'fds/style-properties': ({ dictionary }) => {
      const { allTokens } = dictionary

      return [
        `import { unsafeCSS } from 'lit'\n`,
        ...allTokens.map(({ name, value }) => (
          `export const Fds${name} = /*#__PURE__*/ unsafeCSS("var(--fds-${paramCase(name)}, ${value})")`
        )),
        ''
      ]
        .join('\n')
    }
  },

  platforms: {
    scss: {
      transformGroup: 'scss',
      buildPath: 'src/scss/',
      files: [
        {
          destination: '_tokens.scss',
          format: 'scss/variables'
        }
      ]
    },
    css: {
      transformGroup: 'css',
      buildPath: 'dist/',
      files: [
        {
          destination: 'tokens.css',
          format: 'fds/css-variables'
        },
      ],
    },
    ts: {
      transformGroup: 'js',
      buildPath: 'lib/',
      files: [
        {
          destination: 'tokens.d.ts',
          format: 'fds/typings'
        },
        {
          destination: 'tokens.js',
          format: 'fds/javascript'
        },
        {
          destination: 'style-templates.d.ts',
          format: 'fds/style-template-typings'
        },
        {
          destination: 'style-templates.js',
          format: 'fds/style-templates'
        },
        {
          destination: 'style-properties.d.ts',
          format: 'fds/style-property-typings'
        },
        {
          destination: 'style-properties.js',
          format: 'fds/style-properties'
        }
      ]
    }
  }
}
