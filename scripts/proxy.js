const localProxy = new Proxy(localStorage, {
    get(_, prop) {
        prop = "__vs_" + prop;
        return (localStorage[prop] !== undefined) ? (localStorage[prop] === "undefined") ? undefined : JSON.parse(localStorage[prop]) : undefined;
    },
    set(_, prop, val) {
        prop = "__vs_" + prop;
        localStorage[prop] = JSON.stringify(val);
        return true;
    },
    deleteProperty(_, prop) {
        delete localStorage[prop];
    }
});