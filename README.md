# PMP Protobuf [![NPM version](https://img.shields.io/npm/v/pmp-protobuf.svg)](https://npmjs.com/package/pmp-protobuf)

**PMP Protobuf** is a helper library for the PMP (PenguinMod Project) format and it's protobuf counterpart, which is used in the PenguinMod backend.

## Install

Use NPM:

```sh
npm install pmp-protobuf
```

## Usage

### jsonToProtobuf

```js
import { jsonToProtobuf } from "pmp-protobuf';

const json = /* get the project.json from somewhere... */;

// this will be a Uint8Array
const protobuf = jsonToProtobuf(json);
```

### protobufToJson

```js
import { protobufToJson } from "pmp-protobuf';

const protobuf = /* get the protobuf from somewhere (probably the API)... */;

// this will be an object
const json = protobufToJson(protobuf);
```

### protobufToPMP

```js
import { protobufToPMP } from "pmp-protobuf';

const protobuf = /* get the protobuf from somewhere (probably the API)... */;
const assets = /* get these from somewhere (probably also the API)... */;

// this will be in the PMP format; it will be an ArrayBuffer.
const pmp = await protobufToPMP(protobuf, assets);
```

### jsonToPMP

```js
import { jsonToPMP } from "pmp-protobuf';

const json = /* get the json from somewhere (probably the VM)... */;
const assets = /* get these from somewhere (probably also the VM)... */;

// this will be in the PMP format; it will be an ArrayBuffer.
const pmp = await jsonToPMP(protobuf, assets);
```

## License

[MIT](LICENSE)

## Dev

### Generate Bundle

You install pbjs... somehow... tbh I don't remember... It's been a while.

```bash
pbjs -t json --keep-case path/to/protobufs/project.proto path/to/protobufs/sprite.proto > dest/bundle.json
```
