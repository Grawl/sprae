// common directives just set/map value as is
import { directive, parseExpr } from '../core.js'
import {prop} from 'element-props'

common(`id`), common(`name`), common(`for`), common(`type`), common(`hidden`), common(`disabled`), common(`href`), common(`src`), common(`style`), common(`class`)

function common(name) {
  directive(':'+name, (el) => {
    return value => {
      prop(el, name, value)
    }
  })
}