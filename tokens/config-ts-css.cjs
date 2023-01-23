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
    'fds/typings': ({ dictionary }) => {
      const allType = dictionary
        .allTokens
        .map(token => fdsTokenString(token))
        .join(" | ");

      const colorType = dictionary.allTokens
        .filter(token => fdsType(token) === "FdsColorToken")
        .map(token => fdsTokenString(token))
        .join(" | ");

      return `export type FdsToken = ${allType}\nexport type FdsColorToken = ${colorType}`;
    },
    'fds/javascript': ({ dictionary }) => {
      const tokens = dictionary
        .allTokens
        .map(token => `export const Fds${token.name} = ${fdsTokenString(token)}`)
      return tokens.join("\n");
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
