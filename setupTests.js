require('raf/polyfill')
const { TextEncoder, TextDecoder } = require('util');

// Setup globals
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const Enzyme = require('enzyme')
const EnzymeAdapter = require('@cfaester/enzyme-adapter-react-18').default

// Setup enzyme's react adapter
Enzyme.configure({ adapter: new EnzymeAdapter() })
