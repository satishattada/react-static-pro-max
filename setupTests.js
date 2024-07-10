import 'raf/polyfill'
import Enzyme from 'enzyme'
import EnzymeAdapter from '@cfaester/enzyme-adapter-react-18'
import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextDecoder, TextEncoder });
// Setup enzyme's react adapter
Enzyme.configure({ adapter: new EnzymeAdapter() })
