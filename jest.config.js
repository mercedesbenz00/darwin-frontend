module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  testPathIgnorePatterns: [
    '<rootDir>/test/integration/'
  ],

  transform: {
    'snippets\/(?!index)': '<rootDir>/test/unit/rawTransform.js',
    '^.+\\.vue$': '@vue/vue2-jest',
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.svg$': '<rootDir>/test/unit/svgTransform.js',
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': '<rootDir>/test/unit/stubTransform.js',
    '^.+\\.tsx?$': 'ts-jest'
  },

  transformIgnorePatterns: [
    '/node_modules/(?!(lottie-vuejs|uuid|pinia))'
  ],

  moduleNameMapper: {
    '^vue$': 'vue/dist/vue.common.js',
    '^@/storybook/(.*)$': '<rootDir>/config/storybook/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^test/(.*)$': '<rootDir>/test/$1',
    '^(.+).svg$': '<rootDir>/test/unit/svgTransform.js',
    '^.+.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': '<rootDir>/test/unit/stubTransform.js',
    "^worker-loader!@/(.*)":"<rootDir>/src/$1"
  },

  snapshotSerializers: [
    'jest-serializer-vue'
  ],

  snapshotResolver: './snapshotResolver.js',

  testMatch: [
    '**/src/**/*.(spec|test).(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)',
    '**/test/unit/**/*.test.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)',
    '**/test/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)'
  ],

  setupFilesAfterEnv: ['<rootDir>test/unit/setupTests.ts'],
  setupFiles: ['jest-date-mock'],  
}
