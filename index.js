const JSZip = require("jszip");
const protobuf = require("protobufjs");
const jsonDescriptor = require("./protobuf-bundle.json");
let protobufRoot = protobuf.Root.fromJSON(jsonDescriptor);
let project = protobufRoot.lookupType("project.Project");
const package_json = require("./package.json");
const proto_version = package_json.version;

/**
 * Converts a project.json into a protobuf
 * @param {Object} json The project.json in JSON format
 * @returns {Uint8Array} The protobuf
 */
function jsonToProtobuf(json) {
    function castToString(value) {
        if (typeof value !== "object") {
            return String(value);
        } else {
            return JSON.stringify(value);
        }
    }

    let newjson = {
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

    for (const target in json.targets) {
        const t = json.targets[target];
        let newtarget = {
            id: t.id,
            isStage: t.isStage,
            name: t.name,
            variables: {},
            lists: {},
            broadcasts: t.broadcasts,
            customVars: t.customVars,
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
            textToSpeechLanguage: t.textToSpeechLanguage,
            visible: t.visible,
            extensionData: {},
        };

        for (const extensionData in t.extensionData) {
            newtarget.extensionData[extensionData] = {
                data: castToString(t.extensionData[extensionData]),
                parse: typeof t.extensionData[extensionData] !== "string",
            };
        }

        for (const variable in t.variables) {
            const v = t.variables[variable];
            const isObject = typeof v[1] === "object";
            newtarget.variables[variable] = {
                name: v[0],
                value: castToString(v[1]),
                cloud: String(v[2]) === "true",
                isObject,
            };
        }

        for (const list in t.lists) {
            const l = t.lists[list];
            newtarget.lists[list] = {
                name: l[0],
                value: l[1].map((item) => {
                    return {
                        value: castToString(item),
                        isObject: typeof item === "object",
                    };
                }),
            };
        }

        for (const block in t.blocks) {
            const b = t.blocks[block];
            if (Array.isArray(b)) {
                newtarget.blocks[block] = {
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

            newtarget.blocks[block] = {
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

                const mut = {
                    tagName,
                    proccode,
                    argumentids,
                    argumentnames,
                    argumentdefaults,
                    warp: String(warp) === "true" ? true : false,
                    _returns: returns,
                    edited: Boolean(edited),
                    optype,
                    color,
                    extras: JSON.stringify(extras),
                };

                newtarget.blocks[block].mutation = mut;
            }

            for (const input in b.inputs) {
                newtarget.blocks[block].inputs[input] = JSON.stringify(
                    b.inputs[input],
                );
            }

            for (const field in b.fields) {
                newtarget.blocks[block].fields[field] = JSON.stringify(
                    b.fields[field],
                );
            }
        }

        for (const comment in t.comments) {
            const c = t.comments[comment];
            newtarget.comments[comment] = {
                blockId: c.blockId,
                x: Math.round(c.x || 0),
                y: Math.round(c.y || 0),
                width: Math.round(c.width || 0),
                height: Math.round(c.height || 0),
                minimized: c.minimized,
                text: c.text,
            };
        }

        for (const costume in t.costumes) {
            const c = t.costumes[costume];
            newtarget.costumes[costume] = {
                assetId: c.assetId,
                name: c.name,
                bitmapResolution: c.bitmapResolution,
                rotationCenterX: c.rotationCenterX,
                rotationCenterY: c.rotationCenterY,
                md5ext: c.md5ext ? c.md5ext : `${c.assetId}.${c.dataFormat}`,
                dataFormat: c.dataFormat,
            };
        }

        for (const sound in t.sounds) {
            const s = t.sounds[sound];
            newtarget.sounds[sound] = {
                assetId: s.assetId,
                name: s.name,
                dataFormat: s.dataFormat,
                rate: s.rate,
                sampleCount: s.sampleCount,
                md5ext: s.md5ext ? s.md5ext : `${s.assetId}.${s.dataFormat}`,
            };
        }

        newjson.targets.push(newtarget);
    }

    for (const monitor in json.monitors) {
        const m = json.monitors[monitor];
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

    for (const extensionData in json.extensionData) {
        newjson.extensionData[extensionData] = {
            data: castToString(json.extensionData[extensionData]),
            parse: typeof json.extensionData[extensionData] !== "string",
        };
    }

    const verify = project.verify(newjson);
    if (verify) {
        alert(verify);
        throw new Error(verify);
    }

    return project.encode(project.create(newjson)).finish();
}

/**
 * Converts a protobuf to a project.json for a PMP
 * @param {Uint8Array} buffer The protobuf
 * @returns {Object} The project.json, in JSON format
 */
function protobufToJson(buffer) {
    const message = project.decode(buffer);
    const json = project.toObject(message);

    const newJson = {
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
        let newTarget = {
            isStage: target.isStage || false,
            name: target.name,
            variables: {},
            lists: {},
            broadcasts: target.broadcasts || {},
            customVars: target.customVars || {},
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

        for (const extensionData in target.extensionData) {
            if (target.extensionData[extensionData].parse) {
                newTarget.extensionData[extensionData] = JSON.parse(
                    target.extensionData[extensionData].data,
                );
            } else {
                newTarget.extensionData[extensionData] =
                    target.extensionData[extensionData];
            }
        }

        if (newTarget.isStage) {
            (delete newTarget.visible,
                delete newTarget.size,
                delete newTarget.direction,
                delete newTarget.draggable,
                delete newTarget.rotationStyle);
        }

        for (const variable in target.variables) {
            const val = target.variables[variable].isObject
                ? JSON.parse(target.variables[variable].value)
                : target.variables[variable].value;
            newTarget.variables[variable] = [
                target.variables[variable].name,
                val,
                target.variables[variable].cloud,
            ];
        }

        for (const list in target.lists) {
            const l = target.lists[list];
            let new_values = [];
            if (l.value) {
                new_values = l.value.map((item) =>
                    item.isObject ? JSON.parse(item.value) : item.value,
                );
            } else {
                new_values = l.old_value;
            }

            newTarget.lists[list] = [l.name, new_values || []];
        }

        for (const block in target.blocks) {
            if (target.blocks[block].is_variable_reporter) {
                newTarget.blocks[block] = [
                    target.blocks[block].varReporterBlock.first_num,
                    target.blocks[block].varReporterBlock.name,
                    target.blocks[block].varReporterBlock.id,
                    target.blocks[block].varReporterBlock.second_num,
                    target.blocks[block].varReporterBlock.third_num,
                ];
                continue;
            }

            newTarget.blocks[block] = {
                opcode: target.blocks[block].opcode,
                next: target.blocks[block].next || null,
                parent: target.blocks[block].parent || null,
                inputs: {},
                fields: {},
                shadow: target.blocks[block].shadow,
                topLevel: target.blocks[block].topLevel,
                x: target.blocks[block].x,
                y: target.blocks[block].y,
            };

            if (target.blocks[block].mutation) {
                let extras = {};
                try {
                    extras = JSON.parse(target.blocks[block].mutation.extras);
                } catch {}

                newTarget.blocks[block].mutation = {
                    tagName: target.blocks[block].mutation.tagName,
                    proccode: target.blocks[block].mutation.proccode,
                    argumentids: target.blocks[block].mutation.argumentids,
                    argumentnames: target.blocks[block].mutation.argumentnames,
                    argumentdefaults:
                        target.blocks[block].mutation.argumentdefaults,
                    warp: target.blocks[block].mutation.warp,
                    returns: target.blocks[block].mutation._returns,
                    edited: target.blocks[block].mutation.edited,
                    optype: target.blocks[block].mutation.optype,
                    color: target.blocks[block].mutation.color,
                    hasnext: target.blocks[block].next ? true : false,
                    children: [],
                    ...extras,
                };
            }

            for (const input in target.blocks[block].inputs) {
                newTarget.blocks[block].inputs[input] = JSON.parse(
                    target.blocks[block].inputs[input],
                );
            }

            for (const field in target.blocks[block].fields) {
                newTarget.blocks[block].fields[field] = JSON.parse(
                    target.blocks[block].fields[field],
                );
            }
        }

        newJson.targets.push(newTarget);
    }

    for (const monitor in json.monitors) {
        const m = json.monitors[monitor];
        const newMonitor = {
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

    for (const extensionData in json.extensionData) {
        if (json.extensionData[extensionData].parse) {
            newJson.extensionData[extensionData] = JSON.parse(
                json.extensionData[extensionData].data,
            );
        } else {
            newJson.extensionData[extensionData] =
                json.extensionData[extensionData].data;
        }
    }

    for (const extensionURL in json.extensionURLs) {
        newJson.extensionURLs[extensionURL] = json.extensionURLs[extensionURL];
    }

    return newJson;
}

/**
 * Generates a pmp zip require(parts
 * @param {Uint8Array} protobuf The project.json in protobuf form
 * @param {{buffer:ArrayBuffer,id:String}[]} assets An array of the asset files
 * @returns {Promise<ArrayBuffer>} The zip file
 */
function protobufToPMP(protobuf, assets) {
    const json = protobufToJson(protobuf);

    return jsonToPMP(json, assets);
}

/**
 * Generates a pmp zip via the json and assets
 * @param {Object} project_json The project.json in json form
 * @param {{buffer:ArrayBuffer,id:String}[]} assets An array of the asset files
 * @returns {Promise<ArrayBuffer>} The zip file
 */
async function jsonToPMP(project_json, assets) {
    let zip = new JSZip();
    zip.file("project.json", JSON.stringify(project_json));

    for (const asset of assets) {
        zip.file(asset.id, asset.buffer);
    }

    const arrayBuffer = await zip.generateAsync({ type: "arraybuffer" });

    return arrayBuffer;
}

/**
 * Get the json file and assets from a PMP file. Mostly just so pm-home doesn't need jszip.
 * @param {ArrayBuffer} project_file
 * @returns {Promise<{json:Object,assets:Array<[Blob, string]>}}
 */
async function PMPToParts(project_file) {
    const zip = await JSZip.loadAsync(project_file);

    const json = JSON.parse(await zip.files["project.json"].async("string"));

    const asset_files = zip.files;
    delete asset_files["project.json"];

    const assets = [];
    for (const asset of Object.values(asset_files)) {
        assets.push([await asset.async("blob"), asset.name]);
    }

    return { json, assets };
}

module.exports = {
    jsonToProtobuf,
    protobufToJson,
    protobufToPMP,
    jsonToPMP,
    partsToPMP: jsonToPMP,
    PMPToParts,
};
