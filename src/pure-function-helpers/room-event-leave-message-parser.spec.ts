#!/usr/bin/env ts-node

// tslint:disable:max-line-length
// tslint:disable:no-shadowed-variable

import test  from 'blue-tape'

import {
  MacproMessagePayload,
}                                 from '../schemas'

import {
  roomLeaveEventMessageParser,
}                               from './room-event-leave-message-parser'

test('roomLeaveEventMessageParser() not detected', async t => {
  t.equal(
    roomLeaveEventMessageParser(undefined as any),
    null,
    'should return null for undefined',
  )

  t.equal(
    roomLeaveEventMessageParser('null' as any),
    null,
    'should return null for null',
  )

  t.equal(
    roomLeaveEventMessageParser('test' as any),
    null,
    'should return null for string',
  )

  t.equal(
    roomLeaveEventMessageParser({} as any),
    null,
    'should return null for empty object',
  )

  t.equal(
    roomLeaveEventMessageParser({ content: 'fsdfsfsdfasfas' } as MacproMessagePayload),
    null,
    'should return null for PadproMessagePayload with unknown content',
  )

})
