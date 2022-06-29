function generateQuery(params) {
    return Object.entries(params)
        .filter(([key, value]) => value || value === false)
        .map(([key, value]) => {
            return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        }).join("&");
};

export { generateQuery };