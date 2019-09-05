import grpc from 'grpc'
import util from 'util'
import { log, macproToken } from '../config'

import { MacproRequestClient } from './proto-ts/Macpro_grpc_pb'

import {
  RequestObject,
  ResponseObject,
  MessageStream,
} from './proto-ts/Macpro_pb'
import { EventEmitter } from 'events'
import { CallbackType } from '../schemas'

const PRE = 'GRPC_GATEWAY'

export type GrpcGatewayEvent = 'contact-list' | 'new-friend' | 'scan' | 'login' | 'message' | 'logout' | 'not-login' | 'room-member' | 'room-create' | 'room-join' | 'room-qrcode' | 'reconnect' | 'invalid-token' | 'add-friend' | 'add-friend-before-accept'

export class GrpcGateway extends EventEmitter {

  private token: string
  private endpoint: string
  private client: MacproRequestClient

  constructor (token: string, endpoint: string) {
    super()
    this.endpoint = endpoint
    this.token = token
    this.client = new MacproRequestClient(this.endpoint, grpc.credentials.createInsecure())
  }

  public async request (apiName: string, data?: any): Promise<any> {
    const request = new RequestObject()
    request.setToken(this.token)
    request.setApiname(apiName)

    if (data) {
      request.setData(JSON.stringify(data))
    }

    try {
      const result = await this._request(request)
      const resData = JSON.parse(result.getData())
      log.silly(PRE, `
      ===============================================================
      API Name : ${apiName}
      Request data : ${JSON.stringify(data)}
      Response data : ${JSON.stringify(resData.code || resData)}
      ===============================================================
      `)
      if (result.getToken() !== this.token) {
        throw new Error(`the token are different, be careful with the data`)
      }
      if (JSON.stringify(resData.code) === '1') {
        return resData.data || resData
      } else {
        log.silly(PRE, `error data : ${util.inspect(resData)}`)
      }
    } catch (err) {
      log.silly(PRE, `error : ${util.inspect(err)}`)
      if (err.details === 'INVALID_TOKEN') {
        macproToken()
      }
      throw new Error(`Can not get data from Transmit Server`)
    }
  }

  private async _request (request: RequestObject): Promise<ResponseObject> {
    return new Promise<ResponseObject>((resolve, reject) => {
      this.client.request(
        request,
        (err: Error | null, response: ResponseObject) => {
          if (err !== null) {
            reject(err)
          } else {
            resolve(response)
          }
        }
      )
    })
  }

  public emit (event: 'add-friend-before-accept', data: string): boolean
  public emit (event: 'invalid-token', data: string): boolean
  public emit (event: 'not-login', data: string): boolean
  public emit (event: 'contact-list', data: string): boolean
  public emit (event: 'new-friend', data: string): boolean
  public emit (event: 'add-friend', data: string): boolean
  public emit (event: 'room-member', data: string): boolean
  public emit (event: 'room-create', data: string): boolean
  public emit (event: 'room-join', data: string): boolean
  public emit (event: 'room-qrcode', data: string): boolean
  public emit (event: 'scan', data: string): boolean
  public emit (event: 'login', data: string): boolean
  public emit (event: 'message', data: string): boolean
  public emit (event: 'logout', data: string): boolean
  public emit (event: 'reconnect'): boolean
  public emit (event: never, data: string): never

  public emit (
    event: GrpcGatewayEvent,
    data?: string,
  ): boolean {
    return super.emit(event, data)
  }

  public on (event: 'add-friend-before-accept', listener: ((data: string) => any)): this
  public on (event: 'not-login', listener: ((data: string) => any)): this
  public on (event: 'contact-list', listener: ((data: string) => any)): this
  public on (event: 'new-friend', listener: ((data: string) => any)): this
  public on (event: 'add-friend', listener: ((data: string) => any)): this
  public on (event: 'room-member', listener: ((data: string) => any)): this
  public on (event: 'room-create', listener: ((data: string) => any)): this
  public on (event: 'room-join', listener: ((data: string) => any)): this
  public on (event: 'room-qrcode', listener: ((data: string) => any)): this
  public on (event: 'scan', listener: ((data: string) => any)): this
  public on (event: 'login', listener: ((data: string) => any)): this
  public on (event: 'message', listener: ((data: string) => any)): this
  public on (event: 'logout', listener: ((data: string) => any)): this
  public on (event: 'reconnect', listener: (() => any)): this
  public on (event: never, listener: ((data: string) => any)): never

  public on (
    event: GrpcGatewayEvent,
    listener: ((data: string) => any),
  ): this {
    log.verbose(PRE, `on(${event}, ${typeof listener}) registered`)
    super.on(event, (data: string) => {
      try {
        listener.call(this, data)
      } catch (e) {
        log.error(PRE, `onFunction(${event}) listener exception: ${e}`)
      }
    })
    return this
  }

  public async notify (apiName: string, data?: any) {
    log.silly(PRE, `notify(${apiName}, ${data})`)
    const request = new RequestObject()
    request.setToken(this.token)
    request.setApiname(apiName)

    if (data) {
      request.setData(JSON.stringify(data))
    }

    try {
      const result = this.client.notify(request)

      result.on('error', (err) => {
        log.error(PRE, err.stack)
      })
      result.on('end', () => {
        log.error(PRE, 'grpc server end.')
      })
      result.on('close', () => {
        log.error(PRE, 'grpc server close')
      })
      result.on('data', (data: MessageStream) => {
        log.silly(PRE, `event code :  ${data.getCode()}`)
        switch (data.getCode()) {
          case 'callback-send':
            const dataStr = data.getData()
            const type = JSON.parse(dataStr).type
            if (type === CallbackType.SendAddFriend) {
              this.emit('add-friend-before-accept', data.getData())
            }
            break
          case 'invalid-token':
            macproToken()
            break
          case 'not-login':
            this.emit('not-login', data.getData())
            break
          case 'contact-list' :
            this.emit('contact-list', data.getData())
            break
          case 'room-member' :
            this.emit('room-member', data.getData())
            break
          case 'room-create' :
            this.emit('room-create', data.getData())
            break
          case 'room-join' :
            this.emit('room-join', data.getData())
            break
          case 'room-qrcode' :
            this.emit('room-qrcode', data.getData())
            break
          case 'scan' :
            this.emit('scan', data.getData())
            break
          case 'login' :
            this.emit('login', data.getData())
            break
          case 'message' :
            this.emit('message', data.getData())
            break
          case 'logout' :
            this.emit('logout', data.getData())
            break
          case 'add-friend':
            this.emit('add-friend', data.getData())
            break
          case 'new-friend':
            this.emit('new-friend', data.getData())
            break
          default:
            log.error(PRE, `Can not get the notify`)
            throw new Error(`can not get the notify`)
        }
      })
      await new Promise((resolve, reject) => {
        result.once('error', (err) => {
          log.silly(PRE, 'grpc server error', err)
          return reject(new Error('ERROR'))
        })
        result.once('end', () => {
          log.silly(PRE, 'grpc server end')
          return reject(new Error('END'))
        })
        result.once('close', () => {
          log.silly(PRE, 'grpc server close')
          return reject(new Error('CLOSE'))
        })
        result.once('data', (dataStr: string) => {
          resolve(dataStr)
        })
      })
    } catch (err) {
      log.silly(PRE, `error : ${err}`)
      this.emit('reconnect')
    }
  }

}
