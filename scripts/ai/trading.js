const trades = [{
    bd: true,
    in: {
        type: "shell",
        mean: 1,
        std: 0
    },
    out: {
        type: "grass",
        mean: 10,
        std: 3
    }
}, {
    bd: true,
    in: {
        type: "shell",
        mean: 1,
        std: 0.5
    },
    out: {
        type: "wood",
        mean: 3,
        std: 1
    }
}, {
    bd: true,
    in: {
        type: "shell",
        mean: 1,
        std: 0.5
    },
    out: {
        type: "rocks",
        mean: 3,
        std: 1
    }
}, {
    bd: true,
    in: {
        type: "shell",
        mean: 3,
        std: 1
    },
    out: {
        type: "copper",
        mean: 1,
        std: 0.5
    }
}, {
    bd: true,
    in: {
        type: "shell",
        mean: 4,
        std: 2
    },
    out: {
        type: "iron",
        mean: 1,
        std: 0.5
    }
}]

const evaluateTrade = (template) => {
    let inn = undefined;
    let out = undefined;
    inn = {
        type: template.in.type,
        amount: Math.max(Math.round(Random.randomGaussian(template.in.mean, template.in.std)), 1)
    }
    out = {
        type: template.out.type,
        amount: Math.max(Math.round(Random.randomGaussian(template.out.mean, template.out.std)), 1)
    }
    if (template.bd) {
        if (Math.random() < 0.5) {
            [inn, out] = [out, inn];
        }
    }
    return { in: inn, out };
}

const randomTrade = () => {
    return evaluateTrade(trades[Math.floor(Math.random() * trades.length)]);
}