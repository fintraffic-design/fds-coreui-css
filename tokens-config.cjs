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
          format: 'css/variables'
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
      ]
    }
  }
}