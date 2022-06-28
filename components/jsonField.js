import {withDocument} from 'part:@sanity/form-builder'
import React from "react";

export const BaseMetaInput = withDocument(React.forwardRef((props, focusableRef) => {

  console.log('BaseMetaInput', props)



  return <input type="text"/>
}))
