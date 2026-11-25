import JSZip from "jszip";
import * as protobuf from "protobufjs";
import jsonDescriptor from "./protobuf-bundle.json";
import packageJson from "./package.json";

const protobufRoot = protobuf.Root.fromJSON(
    jsonDescriptor as unknown as protobuf.INamespace,
);
const project = protobufRoot.lookupType("project.Project");
const proto_version: string = packageJson.version;

export type JsonValue =
    | string
    | number
    | boolean
    | null
    | JsonValue[]
    | { [key: string]: JsonValue };

export type VariableEntry = [
    name: string,
    value: JsonValue,
    cloud?: boolean | string,
];

export type ListEntry = [name: string, value: JsonValue[]];

export type VariableReporterBlock = [
    first_num: number,
    name: string,
    id: string,
    second_num?: number,
    third_num?: number,
];

export interface BlockMutation {
    tagName?: string;
    proccode?: string;
    argumentids?: string;
    argumentnames?: string;
    argumentdefaults?: string;
    warp?: boolean | string;
    returns?: string;
    edited?: boolean;
    optype?: string;
    color?: string[];
    hasnext?: boolean;
    children?: unknown[];
    [extra: string]: unknown;
}

export interface Block {
    opcode: string;
    next?: string | null;
    parent?: string | null;
    inputs: Record<string, JsonValue>;
    fields: Record<string, JsonValue>;
    shadow?: boolean;
    topLevel?: boolean;
    x?: number;
    y?: number;
    mutation?: BlockMutation;
}

export interface Comment {
    blockId?: string | null;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    minimized?: boolean;
    text?: string;
}

export interface Costume {
    assetId: string;
    name: string;
    bitmapResolution?: number;
    rotationCenterX?: number;
    rotationCenterY?: number;
    md5ext?: string;
    dataFormat: string;
}

export interface Sound {
    assetId: string;
    name: string;
    dataFormat: string;
    rate?: number;
    sampleCount?: number;
    md5ext?: string;
}

export interface Target {
    id?: string;
    isStage?: boolean;
    name: string;
    variables: Record<string, VariableEntry>;
    lists: Record<string, ListEntry>;
    broadcasts?: Record<string, string>;
    customVars?: unknown[];
    blocks: Record<string, Block | VariableReporterBlock>;
    comments: Record<string, Comment>;
    currentCostume?: number;
    costumes: Costume[];
    sounds: Sound[];
    volume?: number;
    layerOrder?: number;
    x?: number;
    y?: number;
    size?: number;
    direction?: number;
    draggable?: boolean;
    rotationStyle?: string;
    tempo?: number;
    videoTransparency?: number;
    videoState?: string;
    textToSpeechLanguage?: string | null;
    visible?: boolean;
    extensionData: Record<string, JsonValue>;
}

export interface Monitor {
    id: string;
    mode?: string;
    opcode?: string;
    params?: Record<string, string>;
    spriteName?: string | null;
    value?: JsonValue;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    visible?: boolean;
    sliderMin?: number;
    sliderMax?: number;
    isDiscrete?: boolean;
    variableId?: string;
    variableType?: string;
}

export interface ProjectMeta {
    semver: string;
    vm: string;
    agent?: string;
}

export interface ProjectJson {
    targets: Target[];
    monitors: Monitor[];
    extensionData: Record<string, JsonValue>;
    extensions?: string[];
    extensionURLs?: Record<string, string>;
    meta: ProjectMeta;
    customFonts?: unknown[];
    proto_version?: string;
}

interface ProtoExtensionData {
    data: string;
    parse?: boolean;
}

interface ProtoVariable {
    name: string;
    value: string;
    cloud?: boolean;
    isObject?: boolean;
}

interface ProtoListItem {
    value: string;
    isObject?: boolean;
}

interface ProtoList {
    name: string;
    value?: ProtoListItem[];
    old_value?: JsonValue[];
}

interface ProtoMutation {
    tagName?: string;
    proccode?: string;
    argumentids?: string;
    argumentnames?: string;
    argumentdefaults?: string;
    warp?: boolean;
    _returns?: string;
    edited?: boolean;
    optype?: string;
    color?: string[];
    extras?: string;
}

interface ProtoVarReporterBlock {
    first_num: number;
    name: string;
    id: string;
    second_num?: number;
    third_num?: number;
}

interface ProtoBlock {
    opcode?: string;
    next?: string | null;
    parent?: string | null;
    inputs?: Record<string, string>;
    fields?: Record<string, string>;
    shadow?: boolean;
    topLevel?: boolean;
    x?: number;
    y?: number;
    mutation?: ProtoMutation;
    is_variable_reporter?: boolean;
    varReporterBlock?: ProtoVarReporterBlock;
}

interface ProtoTarget {
    id?: string;
    isStage?: boolean;
    name: string;
    variables: Record<string, ProtoVariable>;
    lists: Record<string, ProtoList>;
    broadcasts?: Record<string, string>;
    customVars?: unknown[];
    blocks: Record<string, ProtoBlock>;
    comments?: Record<string, Comment>;
    currentCostume?: number;
    costumes?: Costume[];
    sounds?: Sound[];
    volume?: number;
    layerOrder?: number;
    x?: number;
    y?: number;
    size?: number;
    direction?: number;
    draggable?: boolean;
    rotationStyle?: string;
    tempo?: number;
    videoTransparency?: number;
    videoState?: string;
    textToSpeechLanguage?: string;
    visible?: boolean;
    extensionData: Record<string, ProtoExtensionData>;
    noParseExtensionData?: Record<string, JsonValue>;
}

interface ProtoMonitor {
    id: string;
    mode?: string;
    opcode?: string;
    params?: Record<string, string>;
    spriteName?: string;
    value?: string;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    visible?: boolean;
    sliderMin?: number;
    sliderMax?: number;
    isDiscrete?: boolean;
    variableId?: string;
    variableType?: string;
}

interface ProtoProject {
    targets: ProtoTarget[];
    monitors: ProtoMonitor[];
    extensionData: Record<string, ProtoExtensionData>;
    extensions?: string[];
    extensionURLs?: Record<string, string>;
    metaSemver: string;
    metaVm: string;
    metaAgent?: string;
    fonts?: unknown[];
    proto_version?: string;
}

export interface PMPAsset {
    buffer: ArrayBuffer;
    id: string;
}

function castToString(value: unknown): string {
    if (typeof value !== "object") {
        return String(value);
    } else {
        return JSON.stringify(value);
    }
}

/**
 * Converts a project.json into a protobuf
 * @param json The project.json in JSON format
 * @returns The protobuf
 */
export function jsonToProtobuf(json: ProjectJson): Uint8Array {
    const newjson: ProtoProject = {
        targets: [],
        monitors: [],
        extensionData: {},
        extensions: json.extensions,
        extensionURLs: json.extensionURLs,
        metaSemver: json.meta.semver,
        metaVm: json.meta.vm,
        metaAgent: json.meta.agent,
        fonts: json.customFonts,
        proto_version,
    };

    for (const t of json.targets) {
        const newtarget: ProtoTarget = {
            id: t.id,
            isStage: t.isStage,
            name: t.name,
            variables: {},
            lists: {},
            broadcasts: t.broadcasts,
            customVars: (t as { customVars?: unknown[] }).customVars,
            blocks: {},
            comments: {},
            currentCostume: t.currentCostume,
            costumes: [],
            sounds: [],
            volume: Math.round(t.volume || 0),
            layerOrder: t.layerOrder,
            x: Math.round(t.x || 0),
            y: Math.round(t.y || 0),
            size: Math.round(t.size || 0),
            direction: Math.round(t.direction || 0),
            draggable: t.draggable,
            rotationStyle: t.rotationStyle,
            tempo: t.tempo,
            videoTransparency: t.videoTransparency,
            videoState: t.videoState,
            textToSpeechLanguage: t.textToSpeechLanguage ?? undefined,
            visible: t.visible,
            extensionData: {},
        };

        for (const [key, value] of Object.entries(t.extensionData ?? {})) {
            newtarget.extensionData[key] = {
                data: castToString(value),
                parse: typeof value !== "string",
            };
        }

        for (const [key, v] of Object.entries(t.variables ?? {})) {
            newtarget.variables[key] = {
                name: v[0],
                value: castToString(v[1]),
                cloud: String(v[2]) === "true",
                isObject: typeof v[1] === "object",
            };
        }

        for (const [key, l] of Object.entries(t.lists ?? {})) {
            newtarget.lists[key] = {
                name: l[0],
                value: l[1].map((item) => ({
                    value: castToString(item),
                    isObject: typeof item === "object",
                })),
            };
        }

        for (const [blockId, b] of Object.entries(t.blocks ?? {})) {
            if (Array.isArray(b)) {
                newtarget.blocks[blockId] = {
                    is_variable_reporter: true,
                    varReporterBlock: {
                        first_num: b[0],
                        name: b[1],
                        id: b[2],
                        second_num: b[3],
                        third_num: b[4],
                    },
                };
                continue;
            }

            const newBlock: ProtoBlock = {
                opcode: b.opcode,
                next: b.next,
                parent: b.parent,
                inputs: {},
                fields: {},
                shadow: b.shadow,
                topLevel: b.topLevel,
                x: b.x,
                y: b.y,
            };

            if (b.mutation) {
                const {
                    tagName,
                    proccode,
                    argumentids,
                    argumentnames,
                    argumentdefaults,
                    warp,
                    returns,
                    edited,
                    optype,
                    color,
                    ...extras
                } = b.mutation;

                newBlock.mutation = {
                    tagName,
                    proccode,
                    argumentids,
                    argumentnames,
                    argumentdefaults,
                    warp: String(warp) === "true",
                    _returns: returns,
                    edited: Boolean(edited),
                    optype,
                    color,
                    extras: JSON.stringify(extras),
                };
            }

            for (const [input, value] of Object.entries(b.inputs ?? {})) {
                newBlock.inputs![input] = JSON.stringify(value);
            }

            for (const [field, value] of Object.entries(b.fields ?? {})) {
                newBlock.fields![field] = JSON.stringify(value);
            }

            newtarget.blocks[blockId] = newBlock;
        }

        for (const [commentId, c] of Object.entries(t.comments ?? {})) {
            newtarget.comments![commentId] = {
                blockId: c.blockId,
                x: Math.round(c.x || 0),
                y: Math.round(c.y || 0),
                width: Math.round(c.width || 0),
                height: Math.round(c.height || 0),
                minimized: c.minimized,
                text: c.text,
            };
        }

        for (const c of t.costumes ?? []) {
            newtarget.costumes!.push({
                assetId: c.assetId,
                name: c.name,
                bitmapResolution: c.bitmapResolution,
                rotationCenterX: c.rotationCenterX,
                rotationCenterY: c.rotationCenterY,
                md5ext: c.md5ext ? c.md5ext : `${c.assetId}.${c.dataFormat}`,
                dataFormat: c.dataFormat,
            });
        }

        for (const s of t.sounds ?? []) {
            newtarget.sounds!.push({
                assetId: s.assetId,
                name: s.name,
                dataFormat: s.dataFormat,
                rate: s.rate,
                sampleCount: s.sampleCount,
                md5ext: s.md5ext ? s.md5ext : `${s.assetId}.${s.dataFormat}`,
            });
        }

        newjson.targets.push(newtarget);
    }

    for (const m of json.monitors ?? []) {
        newjson.monitors.push({
            id: m.id,
            mode: m.mode,
            opcode: m.opcode,
            params: m.params,
            spriteName: m.spriteName || "",
            value: String(m.value),
            width: m.width,
            height: m.height,
            x: Math.round(m.x || 0),
            y: Math.round(m.y || 0),
            visible: m.visible,
            sliderMin: Math.round(m.sliderMin || 0),
            sliderMax: Math.round(m.sliderMax || 0),
            isDiscrete: m.isDiscrete,
            variableId: m.variableId,
            variableType: m.variableType,
        });
    }

    for (const [key, value] of Object.entries(json.extensionData ?? {})) {
        newjson.extensionData[key] = {
            data: castToString(value),
            parse: typeof value !== "string",
        };
    }

    const verify = project.verify(newjson);
    if (verify) {
        (globalThis as { alert?: (message: string) => void }).alert?.(verify);
        throw new Error(verify);
    }

    return project.encode(project.create(newjson)).finish();
}

/**
 * Converts a protobuf to a project.json for a PMP
 * @param buffer The protobuf
 * @returns The project.json, in JSON format
 */
export function protobufToJson(buffer: Uint8Array): ProjectJson {
    const message = project.decode(buffer);
    const json = project.toObject(message) as ProtoProject;

    const newJson: ProjectJson = {
        targets: [],
        monitors: [],
        extensionData: {},
        extensions: json.extensions,
        extensionURLs: {},
        meta: {
            semver: json.metaSemver,
            vm: json.metaVm,
            agent: json.metaAgent || "",
        },
        customFonts: json.fonts,
        proto_version: json.proto_version || "UNKNOWN (pre 1.8.6)",
    };

    for (const target of json.targets) {
        const newTarget: Target & { customVars?: unknown[] } = {
            isStage: target.isStage || false,
            name: target.name,
            variables: {},
            lists: {},
            broadcasts: target.broadcasts || {},
            customVars: target.customVars || [],
            blocks: {},
            comments: target.comments || {},
            currentCostume: target.currentCostume,
            costumes: target.costumes || [],
            sounds: target.sounds || [],
            id: target.id,
            volume: target.volume,
            layerOrder: target.layerOrder,
            tempo: target.tempo,
            videoTransparency: target.videoTransparency,
            videoState: target.videoState,
            textToSpeechLanguage: target.textToSpeechLanguage || null,
            visible: target.visible,
            x: target.x,
            y: target.y,
            size: target.size,
            direction: target.direction,
            draggable: target.draggable,
            rotationStyle: target.rotationStyle,
            // legacy. i.e. support older uploaded projects that have this mistake i made
            extensionData: target.noParseExtensionData || {},
        };

        for (const [key, ext] of Object.entries(target.extensionData ?? {})) {
            if (ext.parse) {
                newTarget.extensionData[key] = JSON.parse(ext.data);
            } else {
                newTarget.extensionData[key] = ext.data;
            }
        }

        if (newTarget.isStage) {
            delete newTarget.visible;
            delete newTarget.size;
            delete newTarget.direction;
            delete newTarget.draggable;
            delete newTarget.rotationStyle;
        }

        for (const [key, v] of Object.entries(target.variables ?? {})) {
            const val: JsonValue = v.isObject ? JSON.parse(v.value) : v.value;
            newTarget.variables[key] = [v.name, val, v.cloud];
        }

        for (const [key, l] of Object.entries(target.lists ?? {})) {
            let newValues: JsonValue[] | undefined;
            if (l.value) {
                newValues = l.value.map((item) =>
                    item.isObject ? JSON.parse(item.value) : item.value,
                );
            } else {
                newValues = l.old_value;
            }

            newTarget.lists[key] = [l.name, newValues || []];
        }

        for (const [blockId, b] of Object.entries(target.blocks ?? {})) {
            if (b.is_variable_reporter && b.varReporterBlock) {
                const r = b.varReporterBlock;
                newTarget.blocks[blockId] = [
                    r.first_num,
                    r.name,
                    r.id,
                    r.second_num,
                    r.third_num,
                ];
                continue;
            }

            const newBlock: Block = {
                opcode: b.opcode as string,
                next: b.next || null,
                parent: b.parent || null,
                inputs: {},
                fields: {},
                shadow: b.shadow,
                topLevel: b.topLevel,
                x: b.x,
                y: b.y,
            };

            if (b.mutation) {
                let extras: Record<string, unknown> = {};
                try {
                    extras = JSON.parse(b.mutation.extras as string);
                } catch {
                    // ignore malformed / missing extras
                }

                newBlock.mutation = {
                    tagName: b.mutation.tagName,
                    proccode: b.mutation.proccode,
                    argumentids: b.mutation.argumentids,
                    argumentnames: b.mutation.argumentnames,
                    argumentdefaults: b.mutation.argumentdefaults,
                    warp: b.mutation.warp,
                    returns: b.mutation._returns,
                    edited: b.mutation.edited,
                    optype: b.mutation.optype,
                    color: b.mutation.color,
                    hasnext: b.next ? true : false,
                    children: [],
                    ...extras,
                };
            }

            for (const [input, value] of Object.entries(b.inputs ?? {})) {
                newBlock.inputs[input] = JSON.parse(value);
            }

            for (const [field, value] of Object.entries(b.fields ?? {})) {
                newBlock.fields[field] = JSON.parse(value);
            }

            newTarget.blocks[blockId] = newBlock;
        }

        newJson.targets.push(newTarget);
    }

    for (const m of json.monitors ?? []) {
        const newMonitor: Monitor = {
            id: m.id,
            mode: m.mode,
            opcode: m.opcode,
            params: m.params,
            spriteName: m.spriteName || null,
            value: m.value,
            width: m.width,
            height: m.height,
            x: m.x,
            y: m.y,
            visible: m.visible,
            sliderMin: m.sliderMin,
            sliderMax: m.sliderMax,
            isDiscrete: m.isDiscrete,
            variableId: m.variableId,
            variableType: m.variableType,
        };

        newJson.monitors.push(newMonitor);
    }

    for (const [key, ext] of Object.entries(json.extensionData ?? {})) {
        if (ext.parse) {
            newJson.extensionData[key] = JSON.parse(ext.data);
        } else {
            newJson.extensionData[key] = ext.data;
        }
    }

    for (const [key, url] of Object.entries(json.extensionURLs ?? {})) {
        newJson.extensionURLs![key] = url;
    }

    return newJson;
}

/**
 * Generates a pmp zip from its parts
 * @param protobufBuffer The project.json in protobuf form
 * @param assets An array of the asset files
 * @returns The zip file
 */
export function protobufToPMP(
    protobufBuffer: Uint8Array,
    assets: PMPAsset[],
): Promise<ArrayBuffer> {
    const json = protobufToJson(protobufBuffer);

    return jsonToPMP(json, assets);
}

/**
 * Generates a pmp zip via the json and assets
 * @param project_json The project.json in json form
 * @param assets An array of the asset files
 * @returns The zip file
 */
export async function jsonToPMP(
    project_json: ProjectJson,
    assets: PMPAsset[],
): Promise<ArrayBuffer> {
    const zip = new JSZip();
    zip.file("project.json", JSON.stringify(project_json));

    for (const asset of assets) {
        zip.file(asset.id, asset.buffer);
    }

    return zip.generateAsync({ type: "arraybuffer" });
}

/** Alias of {@link jsonToPMP}. */
export const partsToPMP = jsonToPMP;

/**
 * Get the json file and assets from a PMP file. Mostly just so pm-home doesn't need jszip.
 * @param project_file
 */
export async function PMPToParts(
    project_file: ArrayBuffer | Uint8Array | Blob,
): Promise<{ json: ProjectJson; assets: Array<[Blob, string]> }> {
    const zip = await JSZip.loadAsync(project_file);

    const projectEntry = zip.files["project.json"];
    if (!projectEntry) {
        throw new Error("Invalid PMP: project.json is missing");
    }
    const json = JSON.parse(await projectEntry.async("string")) as ProjectJson;

    const assets: Array<[Blob, string]> = [];
    for (const asset of Object.values(zip.files)) {
        if (asset.name === "project.json") continue;
        assets.push([await asset.async("blob"), asset.name]);
    }

    return { json, assets };
}
