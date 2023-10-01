export type Snippet = {
  id: string
  name: string
  language: string
  text: string
  encrypted: boolean
}

export type CardState = 'default' | 'draggedOut' | 'beingHoverOver'
export type Card = {
  id: string
  title: string
  language: string
  content: string
  encrypted: boolean
  state: CardState
}

export const sampleCards: Card[] = [
  {
    id: 'f94f5',
    title: 'Initialize Clojure',
    language: 'shell',
    content: String.raw
`clj -Ttools \
    install com.github.seancorfield/clj-new '{:git/tag "v1.2.399"}' \
    :as clj-new
clj -Tclj-new app \
    :name backend
clojure -Tclj-new \
    create :template \
    template-name :name \
    project-name :args '[arg1 arg2 arg3 ...]'`,
    encrypted: false,
    state: 'default',
  },
  {
    id: '2082c',
    title: 'Build Aptos NixOS',
    language: 'shell',
    content: String.raw
`export PKG_CONFIG_PATH=/nix/store/g8jc4yh3hgvwjp2q420ddgvc3gb2rpkd-openssl-3.0.8-dev/lib/pkgconfig
export LIBCLANG_PATH=/nix/store/y39v6zn19sazv22241by5chfpicfdb2d-clang-11.1.0-lib/lib
export LD_LIBRARY_PATH=/nix/store/xzn56dy54k0sdgm4lx98c20r81hq41nl-openssl-3.0.8/lib
export PATH=$PATH:/home/thanh/.cargo/bin
export PATH=$PATH:/home/thanh/Sources/overmind-xyz/birthday_bot

dotnet tool install ...`,
    encrypted: false,
    state: 'default',
  },
  {
    id: 'a49d4',
    title: 'Sample .tmuxp.yml',
    language: 'yaml',
    content: String.raw
`session_name: dot-phoenix
windows:
  - window_name: editor
    layout: main-horizontal
    options:
      main-pane-height: 32
    panes:
      - shell_command: nvim
      - null
      - null`,
    encrypted: false,
    state: 'default',
  },
]
