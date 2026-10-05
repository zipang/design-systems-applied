# chat/

The chat demo components. These components are named after the product. They compose
`base/`, `ui/`, and `layout/`. The rules for the tier are in
[`../AGENTS.md`](../AGENTS.md).

## ChatPage

The chat page regions. It owns the conversation through [`useChat`](./useChat.ts). A
sticky `ChatHeader` and the transcript scroll in the page body. The composer is pinned
in the page footer.

`ChatPage` takes no props. The application renders it inside a `PageLayout`.

```tsx
import { ChatPage } from "@components/chat/ChatPage";

<ChatPage />
```

## ChatHeader

The chat identity and the start-over action. It is the `article`'s `header`. It stays
pinned at the top of the scrolling body.

| Prop | Type | Notes |
|------|------|-------|
| `onReset` | `() => void` | Starts a new conversation. |

## MessageList

The conversation transcript. It keeps the newest message in view.

| Prop | Type | Notes |
|------|------|-------|
| `messages` | `ChatMessage[]` | The transcript. |
| `pending` | `boolean` | Shows the typing indicator. |

## Message

One message: a speaker label and a bubble. Eliza sits left on the alternate surface.
The user sits right on the dark surface.

| Prop | Type | Notes |
|------|------|-------|
| `message` | `ChatMessage` | The message to render. |

## TypingIndicator

Three animated dots inside a bubble. It shows while Eliza prepares a reply. It takes no
props.

## Composer

The message composer: an attachment preview, an attach control, a textarea, and a send
button. Enter sends. Shift+Enter starts a new line.

| Prop | Type | Notes |
|------|------|-------|
| `draft` | `string` | The current text. |
| `attachment` | `Attachment \| null` | The pending file. |
| `pending` | `boolean` | Disables the action while Eliza replies. |
| `disabled` | `boolean` | Disables the composer when the conversation ends. |
| `onDraftChange` | `(value: string) => void` | Text change handler. |
| `onAttach` | `(file: File) => void` | File select handler. |
| `onRemoveAttachment` | `() => void` | Removes the pending file. |
| `onSend` | `() => void` | Sends the message. |

## useChat

Owns the conversation state and the Eliza reply engine. It returns a `Chat` object with
the state and the actions that the page binds to its regions.

```ts
const chat = useChat();

chat.messages;
chat.send();
chat.reset();
```

## types

Shared types for the tier:

- `Speaker`: `"eliza"` or `"you"`.
- `Attachment`: `name`, `size`, `type`.
- `ChatMessage`: `id`, `speaker`, `text`, and an optional `attachment`.
