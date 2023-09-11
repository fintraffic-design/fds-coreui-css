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
        .map(token => `export const Fds${token.name}: ${fdsType(token)}`);

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
        .map(token => `export const Fds${token.name} = ${fdsTokenString(token)}`)
        .join("\n")
    },
    'fds/css-variables': ({ dictionary }) => {
      const variables = dictionary
        .allTokens
        .map(token => `  --fds-${token.name}: ${token.value}`)
        .join(";\n")

      return `:root {\n${variables}\n}`
    },
    'fds/lit': ({ dictionary }) => {
      const { Typography } = dictionary.properties

      const styles = Object.entries(Typography).flatMap(([groupName, group]) => (
        Object.entries(group).map(([styleName, style]) => ({
          className: Array.from(
            new Set(
              [groupName, styleName, 'text']
                .join(' ')
                .split(' ')
            )
          )
            .join('-')
            .toLowerCase(),
          properties: Object.entries(style).map(([property, { name }]) => ({ property, token: `Fds${name}` })),
        }))
      ))

      return [
        'import {',
        styles
          .flatMap(style => style.properties.map(property => property.token))
          .sort()
          .map(indent())
          .join(',\n'),
        `} from './tokens'\n`,
        `import { tokenVar } from './token-utils'`,
        `import { css } from 'lit'\n`,
        ...styles
          .sort((a, b) => a.className.localeCompare(b.className))
          .map(style => (
            [
              `export const ${
                uncapitalize(
                  style.className
                    .split('-')
                    .map(capitalize)
                    .join('')
                )
              }Class = css\``,
              `  .${style.className} {`,
              style.properties
                .sort((a, b) => a.property.localeCompare(b.property))
                .map(({ property, token }) => `${property}: \${tokenVar(${token})};`)
                .map(indent(4))
                .join('\n'),
              '  }\n`\n'
            ]
              .join('\n')
        )),
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
          destination: 'lit-styles.js',
          format: 'fds/lit'
        }
      ]
    }
  }
}
