
const fs = require('fs');

function paramCase(name) {
  return name.replace(/([A-Z]|[0-9]+)/g, s => '-' + s.toLowerCase()).replace(/^-/, '')
}

function fdsType(token) {
  if ( token.name.startsWith("Color") ) {
    return "FdsColorToken";
  } else {
    return "FdsToken";
  }
}

function fdsTokenString(token) {
  return `{ name: "fds-${paramCase(token.name)}", value: "${token.value}" }`;
}

module.exports = {
  source: ['tokens/**/*.json'],
  format: {
    test: ({ dictionary }) => {

      const allType = dictionary
        .allTokens
        .map(token => fdsTokenString(token))
        .join(" | ");

      const colorType = dictionary.allTokens
        .filter(token => fdsType(token) === "FdsColorToken")
        .map(token => fdsTokenString(token))
        .join(" | ");

      const tokens = dictionary
        .allTokens
        .map(token => `export const Fds${token.name}: ${fdsType(token)} = ${fdsTokenString(token)}`)
      return [
        `export type FdsToken = ${allType}`,
        `export type FdsColorToken = ${colorType}`,
        tokens.join("\n")
      ].join("\n")
    }
  },

  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables'
        },
      ],
    },
    ts: {
      transformGroup: 'js',
      buildPath: 'dist/',
      files: [
        {
          destination: 'tokens.ts',
          format: 'test'
        },
      ]

    }
  }
}
