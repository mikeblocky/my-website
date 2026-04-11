declare module '*.mdx' {
  import { ComponentType } from 'react'

  const MDXComponent: ComponentType<{ components?: Record<string, unknown> }>

  export default MDXComponent
}