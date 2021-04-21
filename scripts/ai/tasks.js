const tasks = [{
    name: "gather",
    color: "rgb(150, 255, 150)",
    display: [{
        type: "text",
        value: "Gather",
        color: "black"
    }, {
        type: "dropdown",
        values: ["Grass", "Seashells", "Rocks", "Bushes"]
    }, {
        type: "text",
        value: "for",
        color: "black"
    }, {
        type: "range",
        min: 1,
        max: 5
    }, {
        type: "dropdown",
        values: ["times"]
    }]
}, {
    name: "goHome",
    color: "rgb(175, 100, 255)",
    display: [{
        type: "text",
        value: "Go Home",
        color: "black"
    }]
}, {
    name: "storeInventory",
    color: "rgb(255, 175, 100)",
    display: [{
        type: "text",
        value: "Store Inventory",
        color: "black"
    }]
}, {
    name: "equipItem",
    color: "rgb(255, 175, 100)",
    display: [{
        type: "text",
        value: "Equip",
        color: "black"
    }, {
        type: "dropdown",
        values: ["Handaxe", "Pickaxe", "Copper Axe", "Copper Pickaxe", "Iron Axe", "Iron Pickaxe"]
    }, {
        type: "text",
        value: "from chest",
        color: "black"
    }]
}, {
    name: "chopWood",
    color: "rgb(150, 255, 150)",
    display: [{
        type: "text",
        value: "Chop Wood",
        color: "black"
    }, {
        type: "range",
        min: 1,
        max: 5
    }, {
        type: "text",
        value: "times",
        color: "black"
    }]
}, {
    name: "mineRocks",
    color: "rgb(150, 255, 150)",
    display: [{
        type: "text",
        value: "Mine Rocks",
        color: "black"
    }, {
        type: "range",
        min: 1,
        max: 5
    }, {
        type: "text",
        value: "times",
        color: "black"
    }]
}, {
    name: "eat",
    color: "rgb(255, 175, 100)",
    display: [{
        type: "text",
        value: "Eat",
        color: "black"
    }, {
        type: "range",
        min: 1,
        max: 5
    }, {
        type: "dropdown",
        values: ["Tubers"]
    }, {
        type: "text",
        value: "from",
        color: "black"
    }, {
        type: "dropdown",
        values: ["inventory", "chest"]
    }]
}];
const taskDisplayFuncs = {
    "gather": (item, amount, kind) => {
        return `Gather ${item.toLowerCase()}${kind === "seconds" ? " for": ""} ${amount} ${amount === 1 ? kind.slice(0, -1) : kind}`
    },
    "equipItem": (item) => {
        return `Equip ${item} from chest`
    },
    "chopWood": (amount) => {
        return `Chop Wood ${amount} times`
    },
    "mineRocks": (amount) => {
        return `Mine Rocks ${amount} times`
    },
    "eat": (times, food, source) => {
        return `Eat ${food} ${times} times from ${source}`
    }
}