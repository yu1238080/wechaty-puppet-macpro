/* eslint camelcase: 0 */

import { ContactGender } from 'wechaty-puppet/dist/src/schemas/contact'

export interface GrpcRoomPayload {
  number: string,
  name: string,
  thumb: string,
  disturb: number,
}

export interface GrpcRoomDetailInfo {
  code: number,
  msg: string,
  name: string,
  number: string,
  thumb: string,
  disturb: number,
  author: string,
  data: GrpcRoomMember[],
}

export interface GrpcRoomMember {
  account: string,
  account_alias: string,
  name: string,
  sex: number,
  area: string,
  thumb: string,
  description: string,
  my_name: string,
  g_name: string,
}

export interface GrpcRoomQrcode {
  group_nickname: string,
  group_number: string,
  headimg: string,
  owner: string,
  qrcode: string,
  type: string,
}

export interface MacproRoomPayload {
  number: string,
  name: string,
  thumb: string,
  disturb: number,
  members: MacproRoomMemberPayload[],
  owner: string, // owner weixin id
}

export interface GrpcRoomMemberPayload {
  nickName: string,
  displayName: string,
  bigHeadImgUrl: string,
  userName: string,
  number: string, // room id
}

export interface MacproRoomMemberPayload {
  accountAlias: string,
  account: string,
  area: string,
  description: string,
  disturb: string,
  formName: string,
  name: string,
  sex: ContactGender,
  thumb: string,
  v1: string,
}

export interface MacproCreateRoom {
  account: string,
  extend: string,
  name: string,
  headerImage: string,
}

export interface MacproRoomInvitationPayload {
  id       : string,
  fromUser : string,
  roomName : string,
  timestamp: number,
  url      : string,
}
