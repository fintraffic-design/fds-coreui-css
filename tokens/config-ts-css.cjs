module.exports = {
  source: ['tokens/**/*.json'],
  format: {
    tsCss: ({ dictionary }) => {
      const tokens = dictionary
        .allTokens
        .map(token => `  "${token.name}": "var(--${token.name}, ${token.value})"`)
        .join(',\n')
      return `export const tokens = {\n${tokens}\n}`;
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
        }
      ]
    },
    tsCss: {
      transformGroup: 'css',
      buildPath: 'dist/',
      files: [
        {
          destination: 'tokens.ts',
          format: 'tsCss'
        }
      ]
    }
  }
}
