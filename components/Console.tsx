export const Console = ({ content } : { content: string}) => {
  return (
    <pre
      dangerouslySetInnerHTML={{__html: content}}
    />
  )
}