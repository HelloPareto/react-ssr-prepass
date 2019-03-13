// @flow

import type { Node, ComponentType } from 'react'
import { computeProps } from '../element'

import type {
  Hook,
  Frame,
  HooksFrame,
  DefaultProps,
  ComponentStatics
} from '../types'

import {
  type Identity,
  maskContext,
  makeIdentity,
  setCurrentIdentity,
  setCurrentContextMap,
  getCurrentIdentity,
  getCurrentContextMap,
  renderWithHooks,
  setFirstHook,
  getFirstHook
} from '../internals'

const render = (
  type: ComponentType<DefaultProps> & ComponentStatics,
  props: DefaultProps,
  queue: Frame[]
): Node => {
  try {
    return renderWithHooks(
      type,
      computeProps(props, type.defaultProps),
      maskContext(type)
    )
  } catch (error) {
    if (typeof error.then !== 'function') {
      throw error
    }

    queue.push({
      contextMap: getCurrentContextMap(),
      id: getCurrentIdentity(),
      hook: getFirstHook(),
      kind: 'frame.hooks',
      thenable: error,
      props,
      type
    })

    return null
  } finally {
    setCurrentIdentity(null)
  }
}

/** Mount a function component */
export const mount = (
  type: ComponentType<DefaultProps> & ComponentStatics,
  props: DefaultProps,
  queue: Frame[]
): Node => {
  setFirstHook(null)
  setCurrentIdentity(makeIdentity())
  return render(type, props, queue)
}

/** Update a previously suspended function component */
export const update = (queue: Frame[], frame: HooksFrame) => {
  setFirstHook(frame.hook)
  setCurrentIdentity(frame.id)
  setCurrentContextMap(frame.contextMap)
  return render(frame.type, frame.props, queue)
}
