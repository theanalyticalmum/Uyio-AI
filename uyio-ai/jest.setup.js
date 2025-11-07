// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock OpenAI API key for tests
process.env.OPENAI_API_KEY = 'test-key-for-validation-tests'

// Add OpenAI shim for Node environment
import 'openai/shims/node'

