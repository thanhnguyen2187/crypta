export type Snippet = {
  id: string
  name: string
  language: string
  text: string
  encrypted: boolean
}

export type Card = {
  id: string
  title: string
  language: string
  content: string
  encrypted: boolean
  state: 'default' | 'draggedOut' | 'beingHoverOver'
}

export const sampleCards: Card[] = [
  {
    id: 'f94f5',
    title: 'Initialize Clojure',
    language: 'shell',
    content: String.raw
`clj -Ttools \\
    install com.github.seancorfield/clj-new '{:git/tag "v1.2.399"}' \\
    :as clj-new
clj -Tclj-new app \\
    :name backend
clojure -Tclj-new \\
    create :template \\
    template-name :name \\
    project-name :args '[arg1 arg2 arg3 ...]'`,
    encrypted: false,
    state: 'default',
  },
]
