const throwErrors = errors => {
    if (errors.length > 0) {
        throw new Error(errors.join('\n'))
    }
}

const defaultOptions = {
    artifactsDir: './artifacts',
    channel: 'unlisted',
    manifestPath: 'manifest.json',
    sourceDir: 'dist',
}

const verifyConfig = (options, required = []) => {
    const errors = []
    const mergedOptions = { ...defaultOptions, ...options }
    required.forEach(prop => {
        if (mergedOptions[prop] === undefined) {
            errors.push(`${prop} is missing from the options`)
        }
    })
    throwErrors(errors)
    return mergedOptions
}

module.exports = {
    throwErrors,
    verifyConfig,
}