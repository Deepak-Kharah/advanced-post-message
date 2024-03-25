# Advanced Post message

The advanced post message is a simple library that allows you to send messages between windows and iframes. It is a wrapper around the postMessage API, allowing you to return promises and use async/await.

This project is built to understand how [post-robot](https://www.npmjs.com/package/post-robot) works and have an alternative that works with the [NextJS](https://nextjs.org/).

<details>
<summary>Table of contents</summary>

- [Advanced Post message](#advanced-post-message)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Basic usage](#basic-usage)
    - [Returning values from the listener](#returning-values-from-the-listener)
    - [Debug mode](#debug-mode)
    - [Multiple channels](#multiple-channels)
    - [Typescript](#typescript)
  - [API](#api)
    - [AdvancedPostMessage](#advancedpostmessage)
      - [`new AdvancedPostMessage(channelId: string, options: AdvancedPostMessageOptions)`](#new-advancedpostmessagechannelid-string-options-advancedpostmessageoptions)
      - [`advancedPostMessage.send(type: string, payload?: any): Promise<any>`](#advancedpostmessagesendtype-string-payload-any-promiseany)
      - [`advancedPostMessage.on(type: string, listener: (event: MessageEvent) => any): { unregister(): void }`](#advancedpostmessageontype-string-listener-event-messageevent--any--unregister-void-)

</details>

## Installation

Install this package in the primary project and the iframe you want to communicate with.

You can install it using npm:

```bash
npm install advanced-post-message
```

Or using yarn:

```bash
yarn add advanced-post-message
```

## Usage

### Basic usage

Initialize the `AdvancedPostMessage` class with a channel id and the target window. You can use the `send` method to send messages to the target window. You can use the `on` method to listen to messages from the target window.

In the primary project, you can use the `AdvancedPostMessage` class to send messages to the iframe.

```javascript
import AdvancedPostMessage from "advanced-post-message";

const iframe = document.getElementById("iframe");
const advancedPostMessage = new AdvancedPostMessage("channel-id", {
  target: iframe.contentWindow,
});

advancedPostMessage.send("message", { data: "Hello, world!" });
```

In the iframe, you can use the `AdvancedPostMessage` class to receive messages from the primary project.

```javascript
import AdvancedPostMessage from "advanced-post-message";

const advancedPostMessage = new AdvancedPostMessage("channel-id", {
  target: window.parent,
});

advancedPostMessage.on("message", (event) => {
  console.log(event.data); // { data: "Hello, world!" }
});
```

### Returning values from the listener

You can return a value from the listener, which will be sent back to the target window.

In the primary project, you can use the `AdvancedPostMessage` class to send messages to the iframe and receive a response.

```javascript
import AdvancedPostMessage from "advanced-post-message";

const iframe = document.getElementById("iframe");
const advancedPostMessage = new AdvancedPostMessage("channel-id", {
  target: iframe.contentWindow,
});

advancedPostMessage.send("sum", { num1: 10, num2: 11 }).then((sum) => {
  console.log(sum); // 21
});
```

In the iframe, you can use the `AdvancedPostMessage` class to receive messages from the primary project and send a response.

```javascript
import AdvancedPostMessage from "advanced-post-message";

const advancedPostMessage = new AdvancedPostMessage("channel-id", {
  target: window.parent,
});

advancedPostMessage.on("sum", (event) => {
  return event.data.num1 + event.data.num2;
});
```

### Debug mode

You can enable the debug mode to log the messages to the console.

```javascript
import AdvancedPostMessage from "advanced-post-message";

const iframe = document.getElementById("iframe");
const advancedPostMessage = new AdvancedPostMessage("channel-id", {
  target: iframe.contentWindow,
  debug: true,
});
```

### Multiple channels

You can use the same `AdvancedPostMessage` class to communicate with multiple iframes. You can create a new instance of the `AdvancedPostMessage` class with a different channel id and target window.

Even if the events have the same type, they will not interfere with each other.

```javascript
import AdvancedPostMessage from "advanced-post-message";

const iframe1 = document.getElementById("iframe1");
const advancedPostMessage1 = new AdvancedPostMessage("channel-id-1", {
  target: iframe1.contentWindow,
});

const iframe2 = document.getElementById("iframe2");
const advancedPostMessage2 = new AdvancedPostMessage("channel-id-2", {
  target: iframe2.contentWindow,
});
```

### Typescript

This library is written in typescript, so it comes with its own types. You can use the types to get the type of the payload in the listener and the response from the `send` method.

```typescript
import AdvancedPostMessage from "advanced-post-message";

const advancedPostMessage = new AdvancedPostMessage("channel-id", {
  target: window.parent,
});

advancedPostMessage.on<{ from: string }>("message", (event) => {
  const data = event.data;
  console.log(data.from); // Micheal

  return `Hello ${data.from}!`;
});

advancedPostMessage
  .send<string>("message", { from: "Micheal" })
  .then((response) => {
    console.log(response); // Hello Micheal!
  });
```

## API

### AdvancedPostMessage

#### `new AdvancedPostMessage(channelId: string, options: AdvancedPostMessageOptions)`

Create a new instance of the `AdvancedPostMessage` class.

- `channelId` - The channel id to use for the communication.
- `options` - The options to use for the communication.
- `options.target` - The target window to communicate with.
- `options.targetOrigin` - The origin of the target window. This is used to restrict the communication to a specific origin. If not provided, the target origin will be set to `*`.
- `options.suppressErrors` - A boolean to suppress the error logs. If enabled, the class will not throw an error when the target window is not available. This flag is useful when you have a library and you expect some errors. The value is set to `false` by default.
- `options.debug` - A boolean to enable or disable the debug mode. If enabled, the class will log the messages to the console.

#### `advancedPostMessage.send(type: string, payload?: any): Promise<any>`

Send a message to the target window.

- `type` - The type of the message.
- `payload` - The payload of the message.
- Returns a promise that resolves with the response from the target window.

#### `advancedPostMessage.on(type: string, listener: (event: MessageEvent) => any): { unregister(): void }`

Listen to messages from the target window.

- `type` - The type of the message to listen to.
- `listener` - The listener to call when a message is received. The listener will receive the event object as an argument. The listener can return a value, which will be sent back to the target window.
- Returns an object with an `unregister` method to stop listening to messages.

```

```
