# YamSock

Your customizable WebSocket library

## Introduction

The YamSock library is useful when you want to implement a websocket server solution, with a defined protocol.
You can define the protocol with a simple YAML file, and you'll just need to write the code of each handler.

## Usage

### Installation

```shell
$ yarn add yamsock
```

### YAML Schema File

To make yamsock work, you'll need YAML schema files.
Here's an example :

```yaml
version: 1 # Optional, used for future retrocompatibility
schema:
  discriminant: kind
  kinds:
    text:
      type: object
      properties:
        message:
          type: string
          max: 2048
        source:
          type: string
      required:
        - message
        - source
    wizz:
      type: object
      properties:
        target:
          type: string
        required:
          - target
```

The `discriminant` is a required top-level property which is used to define which property will be used to differentiate message types.
The different values the discriminant property can have are described in the `<discriminant>s` object, where every key is one of the discriminant value.

Each value of these keys is a JSONSchema compatible object, defining how the object must be structured in the message, and which properties are required, and whatever defines the structure of the JSON message.

> Every message must be JSON-encoded to be read by the websocket server properly.
