const JSZip = require("jszip");
const protobuf = require("protobufjs");
const jsonDescriptor = require("./protobuf-bundle.json");
let protobufRoot = protobuf.Root.fromJSON(jsonDescriptor);
let project = protobufRoot.lookupType("project.Project");

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
        extensionURLs: {},
        metaSemver: "",
        metaVm: "",
        metaAgent: "",
        fonts: json.customFonts,
    }

    newjson.metaSemver = json.meta.semver;
    newjson.metaVm = json.meta.vm;
    newjson.metaAgent = json.meta.agent;

    for (const target in json.targets) {
        let newtarget = {
            id: json.targets[target].id,
            isStage: json.targets[target].isStage,
            name: json.targets[target].name,
            variables: {},
            lists: {},
            broadcasts: {},
            customVars: [],
            blocks: {},
            comments: {},
            currentCostume: json.targets[target].currentCostume,
            costumes: [],
            sounds: [],
            volume: Math.round(json.targets[target].volume || 0),
            layerOrder: json.targets[target].layerOrder,
            x: Math.round(json.targets[target].x || 0),
            y: Math.round(json.targets[target].y || 0),
            size: Math.round(json.targets[target].size || 0),
            direction: Math.round(json.targets[target].direction || 0),
            draggable: json.targets[target].draggable,
            rotationStyle: json.targets[target].rotationStyle,
            tempo: json.targets[target].tempo,
            videoTransparency: json.targets[target].videoTransparency,
            videoState: json.targets[target].videoState,
            textToSpeechLanguage: json.targets[target].textToSpeechLanguage,
            visible: json.targets[target].visible,
            extensionData: {},
        }

        // loop over the extensionData
        for (const extensionData in json.targets[target].extensionData) {
            newtarget.extensionData[extensionData] = {
                data: castToString(json.extensionData[extensionData]),
                // true if the extension data is not a string
                parse: typeof json.extensionData[extensionData] !== "string"
            }
        }

        // loop over the variables
        for (const variable in json.targets[target].variables) {
            newtarget.variables[variable] = {
                name: json.targets[target].variables[variable][0],
                value: castToString(json.targets[target].variables[variable][1])
            }
        }

        // loop over the lists
        for (const list in json.targets[target].lists) {
            newtarget.lists[list] = {
                name: json.targets[target].lists[list][0],
                value: json.targets[target].lists[list][1].map((item) => castToString(item))
            }
        }

        // loop over the broadcasts
        for (const broadcast in json.targets[target].broadcasts) {
            newtarget.broadcasts[broadcast] = json.targets[target].broadcasts[broadcast];
        }

        // loop over the customVars
        for (const customVar of json.targets[target].customVars) {
            newtarget.customVars.push(customVar);
        }

        const blocks = json.targets[target].blocks;
        // loop over the blocks
        for (const block in blocks) {
            if (Array.isArray(blocks[block])) {
                newtarget.blocks[block] = {
                    is_variable_reporter: true,
                    varReporterBlock: {
                        first_num: blocks[block][0],
                        name: blocks[block][1],
                        id: blocks[block][2],
                        second_num: blocks[block][3],
                        third_num: blocks[block][4],
                    }
                };
                continue;
            }

            // skibidi toilet 🤑🤑🤑

            newtarget.blocks[block] = {
                opcode: blocks[block].opcode,
                next: blocks[block].next,
                parent: blocks[block].parent,
                inputs: {},
                fields: {},
                shadow: blocks[block].shadow,
                topLevel: blocks[block].topLevel,
                x: blocks[block].x,
                y: blocks[block].y
            }

            if (blocks[block].mutation) {
                newtarget.blocks[block].mutation = {
                    tagName: blocks[block].mutation.tagName,
                    proccode: blocks[block].mutation.proccode,
                    argumentids: blocks[block].mutation.argumentids,
                    argumentnames: blocks[block].mutation.argumentnames,
                    argumentdefaults: blocks[block].mutation.argumentdefaults,
                    warp: String(blocks[block].mutation.warp) === "true" ? true : false,
                    _returns: blocks[block].mutation.returns,
                    edited: Boolean(blocks[block].mutation.edited),
                    optype: blocks[block].mutation.optype,
                    color: blocks[block].mutation.color
                }
            }

            // loop over the inputs
            for (const input in blocks[block].inputs) {
                newtarget.blocks[block].inputs[input] = JSON.stringify(blocks[block].inputs[input]);
            }

            // loop over the fields
            for (const field in blocks[block].fields) {
                newtarget.blocks[block].fields[field] = JSON.stringify(blocks[block].fields[field]);
            }
        }

        // loop over the comments
        for (const comment in json.targets[target].comments) {
            newtarget.comments[comment] = {
                blockId: json.targets[target].comments[comment].blockId,
                x: Math.round(json.targets[target].comments[comment].x || 0),
                y: Math.round(json.targets[target].comments[comment].y || 0),
                width: Math.round(json.targets[target].comments[comment].width || 0),
                height: Math.round(json.targets[target].comments[comment].height || 0),
                minimized: json.targets[target].comments[comment].minimized,
                text: json.targets[target].comments[comment].text
            }
        }

        // loop over the costumes
        for (const costume in json.targets[target].costumes) {
            newtarget.costumes[costume] = {
                assetId: json.targets[target].costumes[costume].assetId,
                name: json.targets[target].costumes[costume].name,
                bitmapResolution: json.targets[target].costumes[costume].bitmapResolution,
                rotationCenterX: json.targets[target].costumes[costume].rotationCenterX,
                rotationCenterY: json.targets[target].costumes[costume].rotationCenterY,
                md5ext: json.targets[target].costumes[costume].md5ext,
                dataFormat: json.targets[target].costumes[costume].dataFormat,
            }
        }

        // loop over the sounds
        for (const sound in json.targets[target].sounds) {
            newtarget.sounds[sound] = {
                assetId: json.targets[target].sounds[sound].assetId,
                name: json.targets[target].sounds[sound].name,
                dataFormat: json.targets[target].sounds[sound].dataFormat,
                rate: json.targets[target].sounds[sound].rate,
                sampleCount: json.targets[target].sounds[sound].sampleCount,
                md5ext: json.targets[target].sounds[sound].md5ext
            }
        }

        newjson.targets.push(newtarget);
    }

    // loop over the monitors
    for (const monitor in json.monitors) {
        newjson.monitors.push({
            id: json.monitors[monitor].id,
            mode: json.monitors[monitor].mode,
            opcode: json.monitors[monitor].opcode,
            params: json.monitors[monitor].params,
            spriteName: json.monitors[monitor].spriteName || "",
            value: String(json.monitors[monitor].value),
            width: json.monitors[monitor].width,
            height: json.monitors[monitor].height,
            x: Math.round(json.monitors[monitor].x || 0),
            y: Math.round(json.monitors[monitor].y || 0),
            visible: json.monitors[monitor].visible,
            sliderMin: Math.round(json.monitors[monitor].sliderMin || 0),
            sliderMax: Math.round(json.monitors[monitor].sliderMax || 0),
            isDiscrete: json.monitors[monitor].isDiscrete,
            variableId: json.monitors[monitor].variableId,
            variableType: json.monitors[monitor].variableType,
        });
    }

    // loop over the extensionData
    for (const extensionData in json.extensionData) {
        newjson.extensionData[extensionData] = {
            data: castToString(json.extensionData[extensionData]),
            // true if the extension data is not a string
            parse: typeof json.extensionData[extensionData] !== "string"
        }
    }

    // loop over the extensionURLs
    for (const extensionURL in json.extensionURLs) {
        newjson.extensionURLs[extensionURL] = json.extensionURLs[extensionURL];
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
            agent: json.metaAgent || ""
        },
        customFonts: json.fonts
    };

    for (const target of json.targets) {
        let newTarget = {
            isStage: target.isStage || false,
            name: target.name,
            variables: {},
            lists: {},
            broadcasts: {},
            customVars: [],
            blocks: {},
            comments: {},
            currentCostume: target.currentCostume,
            costumes: [],
            sounds: [],
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
            extensionData: {}
        };

        for (const extensionData in target.extensionData) {
            if (target.extensionData[extensionData].parse) {
                newTarget.extensionData[extensionData] = JSON.parse(json.extensionData[extensionData].data);
            } else {
                newTarget.extensionData[extensionData] = target.extensionData[extensionData];
            }
        }

        if (newTarget.isStage) {
            delete newTarget.visible, delete newTarget.size, delete newTarget.direction, delete newTarget.draggable, delete newTarget.rotationStyle;
        }

        for (const variable in target.variables) {
            newTarget.variables[variable] = [target.variables[variable].name, target.variables[variable].value];
        }

        for (const list in target.lists) {
            newTarget.lists[list] = [target.lists[list].name, target.lists[list].value || []];
        }

        for (const broadcast in target.broadcasts) {
            newTarget.broadcasts[broadcast] = target.broadcasts[broadcast];
        }

        for (const customVar in target.customVars) {
            newTarget.customVars.push(target.customVars[customVar]);
        }

        for (const block in target.blocks) {
            if (target.blocks[block].is_variable_reporter) {
                newTarget.blocks[block] = [
                    target.blocks[block].varReporterBlock.first_num,
                    target.blocks[block].varReporterBlock.name,
                    target.blocks[block].varReporterBlock.id,
                    target.blocks[block].varReporterBlock.second_num,
                    target.blocks[block].varReporterBlock.third_num,
                ]
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
                y: target.blocks[block].y
            }

            if (target.blocks[block].mutation) {
                newTarget.blocks[block].mutation = {
                    tagName: target.blocks[block].mutation.tagName,
                    proccode: target.blocks[block].mutation.proccode,
                    argumentids: target.blocks[block].mutation.argumentids,
                    argumentnames: target.blocks[block].mutation.argumentnames,
                    argumentdefaults: target.blocks[block].mutation.argumentdefaults,
                    warp: target.blocks[block].mutation.warp,
                    returns: target.blocks[block].mutation._returns,
                    edited: target.blocks[block].mutation.edited,
                    optype: target.blocks[block].mutation.optype,
                    color: target.blocks[block].mutation.color,
                    hasnext: target.blocks[block].next ? true : false,
                    children: []
                }
            }

            for (const input in target.blocks[block].inputs) {
                newTarget.blocks[block].inputs[input] = JSON.parse(target.blocks[block].inputs[input]);
            }

            for (const field in target.blocks[block].fields) {
                newTarget.blocks[block].fields[field] = JSON.parse(target.blocks[block].fields[field]);
            }
        }

        for (const comment in target.comments) {
            newTarget.comments[comment] = target.comments[comment];
        }

        for (const costume in target.costumes) {
            newTarget.costumes[costume] = target.costumes[costume];
        }

        for (const sound in target.sounds) {
            newTarget.sounds[sound] = target.sounds[sound];
        }

        newJson.targets.push(newTarget);
    }

    for (const monitor in json.monitors) {
        let newMonitor = {
            id: json.monitors[monitor].id,
            mode: json.monitors[monitor].mode,
            opcode: json.monitors[monitor].opcode,
            params: json.monitors[monitor].params,
            spriteName: json.monitors[monitor].spriteName || null,
            value: json.monitors[monitor].value,
            width: json.monitors[monitor].width,
            height: json.monitors[monitor].height,
            x: json.monitors[monitor].x,
            y: json.monitors[monitor].y,
            visible: json.monitors[monitor].visible,
            sliderMin: json.monitors[monitor].sliderMin,
            sliderMax: json.monitors[monitor].sliderMax,
            isDiscrete: json.monitors[monitor].isDiscrete,
            variableId: json.monitors[monitor].variableId,
            variableType: json.monitors[monitor].variableType
        }

        newJson.monitors.push(newMonitor);
    }

    for (const extensionData in json.antiSigmaExtensionData) {
        // "legacy" shit
        newJson.extensionData[extensionData] = json.antiSigmaExtensionData[extensionData];
    }

    for (const extensionData in json.extensionData) {
        if (json.extensionData[extensionData].parse) {
            newJson.extensionData[extensionData] = JSON.parse(json.extensionData[extensionData].data);
        } else {
            newJson.extensionData[extensionData] = json.extensionData[extensionData].data;
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
 * Generates a pmp zip require(parts
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

    return arrayBuffer
}

module.exports = {
    jsonToProtobuf,
    protobufToJson,
    protobufToPMP,
    jsonToPMP,
}
