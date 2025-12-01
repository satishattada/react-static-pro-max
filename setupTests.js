require('raf/polyfill')
const { TextEncoder, TextDecoder } = require('util');
const { ReadableStream, TransformStream } = require('stream/web');
const { MessageChannel, MessagePort } = require('worker_threads');

// Setup globals for web APIs required by undici/cheerio
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.ReadableStream = ReadableStream;
global.TransformStream = TransformStream;
global.MessageChannel = MessageChannel;
global.MessagePort = MessagePort;

const Enzyme = require('enzyme')
const EnzymeAdapter = require('@cfaester/enzyme-adapter-react-18').default

// Setup enzyme's react adapter
Enzyme.configure({ adapter: new EnzymeAdapter() })
